from fastapi import APIRouter
import uuid
import datetime
import json
from services.embedding import generate_embedding
from vector_db.chroma_client import job_collection
from services.llm_trust_check import check_job_trust

router = APIRouter()


def sanitize_metadata(data: dict):
    """ChromaDB only accepts strings, ints, floats, or bools as metadata values."""
    sanitized = {}
    for k, v in data.items():
        if isinstance(v, (str, int, float, bool)):
            sanitized[k] = v
        else:
            sanitized[k] = str(v) if v is not None else ""
    return sanitized


@router.post("/process-job")
async def process_job(jd: dict):
    embedding_id = jd.get("job_id") or str(uuid.uuid4())
    
    company_id = jd.get("company_id")  

    
    text = f"{jd.get('title','')}\n{jd.get('description','')}\n{jd.get('requirements','')}"

    embedding = generate_embedding(text)
    if hasattr(embedding, "tolist"):
        embedding = embedding.tolist()
    if isinstance(embedding, list) and len(embedding) > 0 and isinstance(embedding[0], list):
        embedding = embedding[0]


    job_collection.add(
        ids=[embedding_id],
        embeddings=[embedding],
        documents=[text],
        metadatas=[sanitize_metadata(jd)]
    )

    trust_info = check_job_trust(jd)
    

    return {
        "embedd_id": embedding_id,
        "company_id": company_id,
        "trusted": trust_info.get("trusted"),
        "confidence": trust_info.get("confidence"),
        "reasoning": trust_info.get("reasoning")
    }