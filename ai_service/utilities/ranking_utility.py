import json
import chromadb
from collections import defaultdict
from database.redis_client import redis_client
from services.llm_reranking import rerank_candidates

# Chroma client
client = chromadb.HttpClient(host="chroma", port=8000)

resume_collection = client.get_collection("resumes")
job_collection = client.get_collection("jobs")


async def perform_ranking_logic(job_id: str, company_id: str):

    cache_key = f"job_ranking:{company_id}:{job_id}"

    # 1️⃣ Check Redis cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # 2️⃣ Build filter
    job_filter = {
        "$and": [
            {"job_id": job_id},
            {"company_id": company_id}
        ]
    }

    # 3️⃣ Fetch Job embedding + text
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

    # 4️⃣ Query resumes using job embedding
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

    # 5️⃣ Aggregate candidate scores
    candidate_scores = defaultdict(list)
    candidate_resumes = {}

    total = len(query_results["ids"][0])

    for i in range(total):

        distance = query_results["distances"][0][i]
        metadata = query_results["metadatas"][0][i]
        document = query_results["documents"][0][i]

        application_id = str(metadata.get("application_id"))
        applicant_id = str(metadata.get("applicant_id"))

        # Convert distance → percentage
        raw_score = (1 - distance) * 100
        percentage_score = max(0, min(100, raw_score))

        key = (application_id, applicant_id)

        candidate_scores[key].append(percentage_score)

        if key not in candidate_resumes:
            candidate_resumes[key] = document

    # 6️⃣ Build candidate list
    ranked = []

    for (application_id, applicant_id), scores in candidate_scores.items():

        final_score = max(scores)

        ranked.append({
            "application_id": application_id,
            "applicant_id": applicant_id,
            "vector_score": round(float(final_score), 2),
            "resume": candidate_resumes[(application_id, applicant_id)]
        })

    # 7️⃣ Sort by vector score
    ranked.sort(
        key=lambda x: x["vector_score"],
        reverse=True
    )

    # 8️⃣ Top candidates for LLM rerank
    top_candidates = ranked[:30]

    final_results = top_candidates[:10]
    source = "vector_search"

    # 9️⃣ LLM Reranking
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

    # 🔟 Remove resume text before response
    for r in final_results:
        if "resume" in r:
            r.pop("resume")

    # 1️⃣1️⃣ Build response
    response = {
        "job_id": job_id,
        "company_id": company_id,
        "source": source,
        "total_candidates": len(ranked),
        "results": final_results
    }

    # 1️⃣2️⃣ Cache for 5 minutes
    redis_client.setex(cache_key, 300, json.dumps(response))

    return response