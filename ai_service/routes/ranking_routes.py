from fastapi import APIRouter
from services.embedding_service import create_embedding
from vector_db.chroma_client import collection
from services.rag_service import explain_match


router = APIRouter()

@router.post("/rank-candidates")
def rank_candidates(job_description: str):

    job_embedding = create_embedding(job_description)

    results = collection.query(
        query_embeddings=[job_embedding],
        n_results=5
    )

    return results

@router.post("/candidate-analysis")
def candidate_analysis(job_description: str):

    job_embedding = create_embedding(job_description)

    results = collection.query(
        query_embeddings=[job_embedding],
        n_results=1
    )

    resume_text = results["documents"][0][0]

    explanation = explain_match(job_description, resume_text)

    return {
        "candidate": results["ids"][0][0],
        "analysis": explanation
    }