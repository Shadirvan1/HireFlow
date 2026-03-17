import json
import chromadb
from collections import defaultdict
from database.redis_client import redis_client
from services.llm_reranking import rerank_candidates

client = chromadb.HttpClient(host="chroma", port=8000)

resume_collection = client.get_collection("resumes")
job_collection = client.get_collection("jobs")


async def perform_ranking_logic(job_id: str, company_id: str):

    cache_key = f"job_ranking:{company_id}:{job_id}"

    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    job_filter = {
        "$and": [
            {"job_id": job_id},
            {"company_id": company_id}
        ]
    }

    job = job_collection.get(
        where=job_filter,
        include=["documents", "embeddings"]
    )

    if job["embeddings"] is None or len(job["embeddings"]) == 0:
        return {
            "job_id": job_id,
            "company_id": company_id,
            "message": "Job not found"
        }

    jd_embedding = job["embeddings"][0]
    job_text = job["documents"][0] if job["documents"] else ""

    query_results = resume_collection.query(
        query_embeddings=[jd_embedding],
        where=job_filter,
        n_results=200,
        include=["metadatas", "documents", "distances"]
    )

    if (
        query_results["ids"] is None
        or len(query_results["ids"]) == 0
        or len(query_results["ids"][0]) == 0
    ):
        return {
            "job_id": job_id,
            "company_id": company_id,
            "message": "No candidates applied"
        }

    candidate_scores = defaultdict(list)

    # 🆕 store multiple chunks
    candidate_chunks = defaultdict(list)

    total = len(query_results["ids"][0])

    for i in range(total):

        distance = query_results["distances"][0][i]
        metadata = query_results["metadatas"][0][i]
        document = query_results["documents"][0][i]

        application_id = str(metadata.get("application_id"))
        applicant_id = str(metadata.get("applicant_id"))

        raw_score = (1 - distance) * 100
        percentage_score = max(0, min(100, raw_score))

        key = (application_id, applicant_id)

        candidate_scores[key].append(percentage_score)

        # 🆕 collect chunks
        if len(candidate_chunks[key]) < 3:  # limit chunks per candidate
            candidate_chunks[key].append(document)

    ranked = []

    for (application_id, applicant_id), scores in candidate_scores.items():

        final_score = max(scores)

        # 🆕 combine chunks
        combined_resume = "\n\n".join(candidate_chunks[(application_id, applicant_id)])

        ranked.append({
            "application_id": application_id,
            "applicant_id": applicant_id,
            "vector_score": round(float(final_score), 2),
            "resume": combined_resume
        })

    ranked.sort(
        key=lambda x: x["vector_score"],
        reverse=True
    )

    top_candidates = ranked[:30]

    final_results = top_candidates[:10]
    source = "vector_search"

    try:

        llm_results = rerank_candidates(job_text, top_candidates)

        if llm_results and len(llm_results) > 0:

            valid_ids = {c["application_id"] for c in top_candidates}

            llm_map = {
                str(item["application_id"]): item["score"]
                for item in llm_results
                if str(item["application_id"]) in valid_ids
            }

            for cand in top_candidates:
                cand["llm_score"] = llm_map.get(cand["application_id"], 0)

            final_results = sorted(
                top_candidates,
                key=lambda x: x.get("llm_score", 0),
                reverse=True
            )[:10]

            source = "groq_rerank"

    except Exception as e:
        print("LLM rerank error:", e)

    for r in final_results:
        if "resume" in r:
            r.pop("resume")

    response = {
        "job_id": job_id,
        "company_id": company_id,
        "source": source,
        "total_candidates": len(ranked),
        "results": final_results
    }

    redis_client.setex(cache_key, 300, json.dumps(response))
    return response



import asyncio


async def rank_single_candidate(application_id: str, job_id: str, company_id: str):
    print(f"[RANKING START] app={application_id}, job={job_id}, company={company_id}")

    try:
        # 1. Get Job Embedding
        job_filter = {"$and": [{"job_id": job_id}, {"company_id": company_id}]}
        job_data = job_collection.get(
            where=job_filter,
            include=["documents", "embeddings"]
        )

        embeddings = job_data.get("embeddings")
        if embeddings is None or len(embeddings) == 0:
            print(f"[ERROR] No embeddings found for job {job_id}")
            return None

        jd_embedding = embeddings[0]

        documents = job_data.get("documents") or []
        job_text = documents[0] if documents else ""

        print(f"[JOB] embedding_dim={len(jd_embedding)}, text_preview={job_text[:80]}")

        # 2. Query Candidate Chunks (ONLY THIS, no .get())
        query_result = resume_collection.query(
            query_embeddings=[jd_embedding],
            where={"application_id": str(application_id)},
            n_results=20,  # increased for better accuracy
            include=["distances", "documents"]
        )

        distances = query_result.get("distances")
        docs = query_result.get("documents")

        if (
            distances is None
            or len(distances) == 0
            or len(distances[0]) == 0
        ):
            print(f"[ERROR] No matching resume chunks found for {application_id}")
            return None

        # 3. Compute Vector Score (FIXED for L2)
        best_distance = min(distances[0])
        vector_score = round(100 / (1 + best_distance), 2)

        print(f"[VECTOR SCORE] best_distance={best_distance}, score={vector_score}")

        # 4. Prepare Resume for LLM
        top_docs = docs[0] if docs else []
        combined_resume = "\n\n".join(top_docs[:5])  # top 5 chunks

        # 5. LLM Reranking
        final_score = vector_score

        try:
            candidate_obj = [{
                "application_id": application_id,
                "vector_score": vector_score,
                "resume": combined_resume
            }]

            loop = asyncio.get_running_loop()

            llm_results = await loop.run_in_executor(
                None,
                rerank_candidates,   # your existing function
                job_text,
                candidate_obj
            )

            if llm_results and len(llm_results) > 0:
                final_score = llm_results[0].get("score", vector_score)

        except Exception as llm_err:
            print(f"[LLM ERROR] {llm_err}")
            final_score = vector_score  # fallback

        print(f"[FINAL SCORE] app={application_id}, final={final_score}, vector={vector_score}")

        return {
            "application_id": application_id,
            "final_score": final_score,
            "vector_score": vector_score
        }

    except Exception as e:
        print(f"[FATAL ERROR] Ranking failed: {e}")
        return None