from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid
import datetime
from io import BytesIO
from database.mongo_client import logs_collection
from services.resume_parser import extract_text_from_bytes  # updated for bytes
from services.embedding import generate_embedding
from vector_db.chroma_client import resume_collection
from storages.minio_client import minio_client, BUCKET_NAME
import asyncio
from services.chunker import chunk_text
from database.redis_client import redis_client
router = APIRouter()

@router.get("/get")
async def check():
    data = resume_collection.get(
        ids=["17_chunk_0"],
        include=["embeddings", "documents", "metadatas"]
    )

    # Use 'is not None' to avoid the NumPy ambiguity error
    embeddings = data.get("embeddings")
    
    if embeddings is not None and len(embeddings) > 0:
        data["embeddings"] = [
            e.tolist() if hasattr(e, "tolist") else e 
            for e in embeddings
        ]


    live = resume_collection.get(
        ids=["15_chunk_1"],
        include=["embeddings", "documents", "metadatas"]
    )
    
    if live.get("embeddings") is not None:
        live["embeddings"] = [
            e.tolist() if hasattr(e, "tolist") else e 
            for e in live["embeddings"]
        ]

    return {
        "ids": data.get("ids"),
        "documents": data.get("documents"),
        "metadatas": data.get("metadatas"),
        "embeddings": data.get("embeddings"),
        "live_sample": live
    }


@router.post("/process-resume")
async def process_resume(
    applicant_id: str = Form(...),
    job_embedding_id: str = Form(...),
    application_id: str = Form(...),
    company_id: str = Form(...),  # <--- Added company_id field
    file: UploadFile = File(...)
    ):
    """
    Handles Multi-Cloud storage (MinIO), Vector Indexing (Chroma), 
    and Audit Logging (Mongo) with company-level scoping.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_id = str(uuid.uuid4())
    # Scoping by company_id and job_id for structured storage
    object_name = f"resumes/{company_id}/{job_embedding_id}/{file_id}.pdf" 

    content = await file.read()
    
    try:
        # 1. MinIO Upload with company_id metadata
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: minio_client.put_object(
            BUCKET_NAME,
            object_name,
            data=BytesIO(content),
            length=len(content),
            content_type=file.content_type,
            metadata={
                "applicant_id": applicant_id, 
                "application_id": application_id,
                "company_id": company_id  # <--- Added to MinIO
            }
        ))

        # 2. Text Extraction & Chunking
        text = extract_text_from_bytes(content)
        if not text.strip():
            raise ValueError("Could not extract text from PDF")

        chunks = chunk_text(text)

        embeddings, documents, metadatas, ids = [], [], [], []

        for i, chunk in enumerate(chunks):
            embedding = generate_embedding(chunk)

            if hasattr(embedding, "tolist"):
                embedding = embedding.tolist()
            if isinstance(embedding, list) and len(embedding) > 0 and isinstance(embedding[0], list):
                embedding = embedding[0]

            chunk_id = f"{application_id}_chunk_{i}"

            ids.append(chunk_id)
            embeddings.append(embedding)
            documents.append(chunk)

            # 3. Add company_id to Chroma Metadata for efficient filtering
            metadatas.append({
                "company_id": company_id,  # <--- Critical for multi-tenancy
                "job_id": job_embedding_id,
                "applicant_id": applicant_id,
                "file_path": object_name,
                "resume_id": file_id,
                "application_id": application_id,
                "chunk_index": i
            })

        # 4. Store in ChromaDB
        resume_collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        
        # Clear redis cache if necessary
        cache_key = f"job_ranking:{company_id}:{job_embedding_id}"
        redis_client.delete(cache_key)
        # redis_client.delete(f"results:{job_embedding_id}") 

        # 5. MongoDB Audit Log with company_id
        log_entry = {
            "company_id": company_id,  # <--- Added to Logs
            "application_id": application_id,
            "resume_id": file_id,
            "job_id": job_embedding_id,
            "filename": file.filename,
            "storage_path": object_name,
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            "vector_dim": len(embedding)
        }
        logs_collection.insert_one(log_entry)

        return {
            "status": "success",
            "company_id": company_id,
            "application_id": application_id,
            "indexed": True
        }

    except Exception as e:
        logs_collection.insert_one({
            "company_id": company_id,
            "application_id": application_id,
            "error": str(e),
            "timestamp": datetime.datetime.now(datetime.timezone.utc)
        })
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")