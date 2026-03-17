from fastapi import APIRouter
import json
import chromadb
from collections import defaultdict
from database.redis_client import redis_client
from services.llm_reranking import rerank_candidates
from utilities.chroma_format import format_chroma_results
from fastapi import HTTPException


router = APIRouter()

client = chromadb.HttpClient(host="chroma", port=8000)

resume_collection = client.get_collection("resumes")
job_collection = client.get_collection("jobs")


@router.get("/rank/{job_id}")
def rank_candidates(job_id: str):

    cache_key = f"job_ranking:{job_id}"

    # 1️⃣ Check Redis Cache
    cached = redis_client.get(cache_key)
    # if cached:
    #     return json.loads(cached)

    # 2️⃣ Get Job Embedding
    job = job_collection.get(
        where={"job_id": job_id},
        include=["embeddings", "documents"]
    )

    if job["embeddings"] is None or len(job["embeddings"]) == 0:
        return {"error": "Job not found"}

    jd_embedding = job["embeddings"][0]
    job_text = job["documents"][0] if job["documents"] else ""

    # 3️⃣ Search Resume Chunks
    query_results = resume_collection.query(
        query_embeddings=[jd_embedding],
        where={"job_id": job_id},
        n_results=200,
        include=["metadatas", "documents", "distances"]
    )

    if not query_results["ids"] or len(query_results["ids"][0]) == 0:
        return {"message": "No candidates applied"}

    # 4️⃣ Aggregate chunk scores
    candidate_scores = defaultdict(list)
    candidate_resumes = {}

    for i in range(len(query_results["ids"][0])):

        distance = query_results["distances"][0][i]
        metadata = query_results["metadatas"][0][i]
        document = query_results["documents"][0][i]

        application_id = metadata.get("application_id")
        applicant_id = metadata.get("applicant_id")

        raw_score = (1 - distance) * 100
        percentage_score = max(0, min(100, raw_score))

        key = (application_id, applicant_id)

        candidate_scores[key].append(percentage_score)

        # store resume text
        if key not in candidate_resumes:
            candidate_resumes[key] = document

    # 5️⃣ Create Candidate List
    ranked = []

    for (application_id, applicant_id), scores in candidate_scores.items():

        final_score = max(scores)

        ranked.append({
            "application_id": application_id,
            "applicant_id": applicant_id,
            "vector_score": round(float(final_score), 2),
            "resume": candidate_resumes[(application_id, applicant_id)]
        })

    # 6️⃣ Sort by vector score
    ranked = sorted(ranked, key=lambda x: x["vector_score"], reverse=True)

    top_candidates = ranked[:50]

    # 8️⃣ LLM Re-ranking with Fallback Logic
    final_results = top_candidates[:20] # Default fallback
    source = "vector_search"

    try:
        # We only pass the top 15 to the LLM to respect rate limits
        llm_scored_list = rerank_candidates(job_text, top_candidates)
        
        if llm_scored_list:
            # Map LLM scores back to the candidate objects
            llm_map = {item['application_id']: item['score'] for item in llm_scored_list}
            
            for cand in top_candidates:
                cand['llm_score'] = llm_map.get(cand['application_id'], 0)
            
            # Re-sort based on LLM score
            final_results = sorted(top_candidates, key=lambda x: x.get('llm_score', 0), reverse=True)
            source = "gemini_rerank"
            
    except Exception:
        # If all retries fail, final_results stays as top_candidates
        pass

    # 9️⃣ Cache and Return
    response_data = {"source": source, "data": final_results}
    redis_client.setex(cache_key, 300, json.dumps(response_data))

    return response_data


import asyncio
from utilities.ranking_utility import perform_ranking_logic
@router.post("/rank-batch")
async def rank_batch(data: dict):
    print("Received batch ranking request:", data)

    job_ids = data.get("job_ids")
    company_id = data.get("company_id")

    if not company_id:
        raise HTTPException(status_code=400, detail="company_id is required")

    if not job_ids:
        raise HTTPException(status_code=400, detail="job_ids are required")

    try:
        # Run all ranking tasks concurrently
        tasks = [
            perform_ranking_logic(job_id, company_id)
            for job_id in job_ids
        ]

        results = await asyncio.gather(*tasks)

        # Remove empty results
        results = [r for r in results if r]
        print(f"Batch ranking completed. Total jobs processed: {len(results)}")
        print(company_id, job_ids,results)
        return {
            "company_id": company_id,
            "total_jobs": len(job_ids),
            "results": results
        }

    except Exception as e:
        print( HTTPException(status_code=500, detail=str(e)))