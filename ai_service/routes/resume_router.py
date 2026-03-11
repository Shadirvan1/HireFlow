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


router = APIRouter()


@router.get("/get")
async def check():
    data = resume_collection.get(
        ids=["b24c2d7d-7d79-4170-9d5c-5b85158b95de"],
        include=["embeddings", "documents", "metadatas"]
    )

    embeddings = data.get("embeddings")
    if embeddings is not None and hasattr(embeddings, "tolist"):
        embeddings = embeddings.tolist()
            
    return {
        "ids": data.get("ids"),
        "documents": data.get("documents"),
        "metadatas": data.get("metadatas"),
        "embeddings": embeddings[0] if embeddings else [] 
    }



@router.post("/process-resume")
async def process_resume(
    applicant_id: str = Form(...),
    job_embedding_id: str = Form(...),
    application_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Handles Multi-Cloud storage (MinIO), Vector Indexing (Chroma), 
    and Audit Logging (Mongo) in a single optimized flow.
    """
    # 1. Validation & Setup
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_id = str(uuid.uuid4())
    object_name = f"resumes/{job_embedding_id}/{file_id}.pdf" # Scoped by Job ID for better MinIO org

    # 2. Parallel Processing Prep
    content = await file.read()
    
    try:
        # 3. MinIO Upload (Using a threadpool to keep FastAPI async)
        # We do this first so the file is safely stored before processing
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: minio_client.put_object(
            BUCKET_NAME,
            object_name,
            data=BytesIO(content),
            length=len(content),
            content_type=file.content_type,
            metadata={"applicant_id": applicant_id, "application_id": application_id}
        ))

        # 4. Text Extraction & Embedding
        # Extracting text from bytes as per your helper
        text = extract_text_from_bytes(content)
        if not text.strip():
            raise ValueError("Could not extract text from PDF (Empty or Scanned Image)")

        embedding = generate_embedding(text)
        
        # Flatten embedding if necessary
        if hasattr(embedding, "tolist"):
            embedding = embedding.tolist()
        if isinstance(embedding, list) and len(embedding) > 0 and isinstance(embedding[0], list):
            embedding = embedding[0]

        # 5. ChromaDB Vector Storage (Linked to Job)
        resume_collection.add(
            ids=[application_id], # Use the DB application ID for easy lookup
            embeddings=[embedding],
            documents=[text],
            metadatas=[{
                "job_id": job_embedding_id,
                "applicant_id": applicant_id,
                "file_path": object_name,
                "resume_id": file_id
            }]
        )

        # 6. MongoDB Audit Log
        log_entry = {
            "application_id": application_id,
            "resume_id": file_id,
            "job_id": job_embedding_id,
            "filename": file.filename,
            "storage_path": object_name,
            "timestamp": datetime.datetime.now(datetime.timezone.utc),
            "vector_dim": len(embedding),
            "text_preview": text[:200]
        }
        logs_collection.insert_one(log_entry)

        return {
            "status": "success",
            "application_id": application_id,
            "minio_object": object_name,
            "indexed": True
        }

    except Exception as e:
        # Log failure in Mongo even if it crashes
        logs_collection.insert_one({
            "application_id": application_id,
            "error": str(e),
            "timestamp": datetime.datetime.now(datetime.timezone.utc)
        })
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")