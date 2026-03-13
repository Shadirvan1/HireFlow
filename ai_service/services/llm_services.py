from .embedding import generate_embedding
from vector_db.chroma_client import job_collection, resume_collection
from services.chat_service import ask_llm



def search_jobs(query: str, top_k: int = 10):

    try:

        query_embedding = generate_embedding(query)

        results = job_collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        jobs = []

        ids = results.get("ids", [[]])[0]
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for i in range(len(ids)):
            jobs.append({
                "job_id": ids[i],
                "job_text": documents[i],
                "metadata": metadatas[i],
                "vector_score": distances[i]
            })

      
        answer = ask_llm(
            question=query,
            candidates=None,
            jobs=jobs
        )

        return {
            "answer": answer,
            "jobs": jobs
        }

    except Exception as e:
        print("Job search error:", e)

        return {
            "answer": "Sorry, I couldn't retrieve job information right now.",
            "jobs": []
        }
    

def search_candidates(query: str, top_k: int = 10):

    try:

        embedding = generate_embedding(query)

        results = resume_collection.query(
            query_embeddings=[embedding],
            n_results=top_k
        )

        candidates = []

        ids = results.get("ids", [[]])[0]
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for i in range(len(ids)):
            candidates.append({
                "candidate_id": ids[i],
                "resume_text": documents[i],
                "metadata": metadatas[i],
                "vector_score": distances[i]
            })

        # Send data to LLM for reasoning
        answer = ask_llm(
            question=query,
            candidates=candidates,
            jobs=None
        )

        return {
            "answer": answer,
            "candidates": candidates
        }

    except Exception as e:

        print("Candidate search error:", e)

        return {
            "answer": "Sorry, I couldn't retrieve candidate information right now.",
            "candidates": []
        }