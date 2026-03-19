from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid
import datetime
import os
import asyncio
import cloudinary
import cloudinary.uploader
from database.mongo_client import logs_collection
from services.resume_parser import extract_text_from_bytes
from services.embedding import generate_embedding
from vector_db.chroma_client import resume_collection
from services.chunker import chunk_text
from database.redis_client import redis_client
from utilities.ranking_utility import rank_single_candidate
import requests

# --- CLOUDINARY CONFIGURATION ---
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME', 'dj046s16s'),
    api_key=os.environ.get('CLOUDINARY_API_KEY', "598374668928111"),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET', "eBHyrHUQeljXs7peZ7pb5YVvAPQ"),
    secure=True
)

router = APIRouter()

@router.post("/process-resume")
async def process_resume(
    job_embedding_id: str = Form(...),
    application_id: str = Form(...),
    company_id: str = Form(...),
    file: UploadFile = File(...),
    is_automatic: str = Form("False"),
    ats_score_threshold: float = Form(70.0),
    job_title: str = Form("Job Opening"),
    candidate_email: str = Form(""),
    hr_email: str = Form("")
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_id = str(uuid.uuid4())
    # Cloudinary "public_id" (replaces object_name)
    public_id = f"resumes/{company_id}/{job_embedding_id}/{file_id}"
    
    content = await file.read()
    
    try:
        print(f"--- Starting Cloudinary Processing for App: {application_id} ---")

       
        loop = asyncio.get_event_loop()
        upload_result = await loop.run_in_executor(None, lambda: cloudinary.uploader.upload(
            content,
            public_id=public_id,
            folder="hireflow/resumes",
            resource_type="raw"  # Use "raw" for PDFs to keep original format
        ))
        
        resume_url = upload_result.get("secure_url")
        print(f"Uploaded to Cloudinary: {resume_url}")

        # 2. Text Extraction & Chunking
        text = extract_text_from_bytes(content)
        chunks = chunk_text(text)

        # 3. Embedding & ChromaDB Storage
        embeddings = [generate_embedding(chunk) for chunk in chunks]
        chunk_ids = [f"{application_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{
            "application_id": str(application_id), 
            "company_id": str(company_id),
            "job_id": str(job_embedding_id),
            "resume_url": resume_url  # Storing the cloud URL for easy retrieval
        } for _ in range(len(chunks))]

        resume_collection.add(
            ids=chunk_ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )

        # 4. Ranking
        ranking_result = await rank_single_candidate(
            application_id=str(application_id),
            job_id=str(job_embedding_id),
            company_id=str(company_id)
        )

        final_score = ranking_result.get("final_score", 0) if ranking_result else 0

        # 5. TRIGGER n8n AUTOMATION
        n8n_triggered = False
        if is_automatic == "True" and final_score >= ats_score_threshold:
            # ... (Your existing n8n logic stays the same)
            pass

        # 6. Logging & Cache Cleanup
        cache_key = f"job_ranking:{company_id}:{job_embedding_id}"
        redis_client.delete(cache_key)
        
        logs_collection.insert_one({
            "application_id": application_id,
            "score": final_score,
            "resume_url": resume_url,
            "n8n_sent": n8n_triggered,
            "timestamp": datetime.datetime.now(datetime.timezone.utc)
        })
    
        return {
            "status": "success",
            "application_id": application_id,
            "score": final_score,
            "resume_url": resume_url
        }

    except Exception as e:
        print(f"FATAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))