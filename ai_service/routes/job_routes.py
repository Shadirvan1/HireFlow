from fastapi import APIRouter
from services.embedding_service import create_embedding

router = APIRouter()

@router.post("/create-job")
def create_job(job_description: str):

    embedding = create_embedding(job_description)

    return {
        "job_description": job_description,
        "embedding": embedding
    }