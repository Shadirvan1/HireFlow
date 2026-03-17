from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid
import datetime
from io import BytesIO
import requests  # Required for calling n8n
from database.mongo_client import logs_collection
from services.resume_parser import extract_text_from_bytes
from services.embedding import generate_embedding
from vector_db.chroma_client import resume_collection
from storages.minio_client import minio_client, BUCKET_NAME
import asyncio
from services.chunker import chunk_text
from database.redis_client import redis_client
from utilities.ranking_utility import rank_single_candidate
import os
router = APIRouter()

@router.post("/process-resume")
async def process_resume(
    job_embedding_id: str = Form(...),
    application_id: str = Form(...), # Essential for callback logic
    company_id: str = Form(...),
    file: UploadFile = File(...),
    is_automatic: str = Form("False"),
    ats_score_threshold: float = Form(70.0),
    job_title: str = Form("Job Opening"),
    candidate_email: str = Form(""),
    interviewer_email: str = Form("") # Added this to know whose calendar to check
    ):
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_id = str(uuid.uuid4())
    object_name = f"resumes/{company_id}/{job_embedding_id}/{file_id}.pdf" 
    content = await file.read()
    
    try:
        # 1. MinIO Upload (Standard logic)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: minio_client.put_object(
            BUCKET_NAME, object_name, data=BytesIO(content),
            length=len(content), content_type=file.content_type
        ))

        # 2. Text Extraction, Chunking & Embedding (Standard logic)
        text = extract_text_from_bytes(content)
        chunks = chunk_text(text)
        # ... (Your existing embedding loop here) ...

        ranking_result = await rank_single_candidate(
            application_id=application_id,
            job_id=job_embedding_id,
            company_id=company_id
        )
        final_score = ranking_result.get("final_score", 0) if ranking_result else 0

        # 5. TRIGGER n8n AUTOMATION (The "Intelligence" Part)
        n8n_triggered = False
        
        if is_automatic == "True" and final_score >= ats_score_threshold:
            # Use the internal Docker network name if running in Docker
            N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
            
            payload = {
                "application_id": application_id,     # For Django Callback
                "candidate_email": candidate_email,   # To invite candidate
                "interviewer_email": interviewer_email, # To check calendar availability
                "job_title": job_title,
                "ats_score": round(final_score, 2)
            }
            
            headers = {"X-N8N-API-KEY": os.getenv("N8N_PASS")}  
            
            try:
                
                requests.post(N8N_WEBHOOK_URL, json=payload, headers=headers, timeout=5)
                n8n_triggered = True
            except Exception as n8n_err:
                print(f"n8n Webhook failed: {n8n_err}")

        # 6. Logging & Cache Cleanup
        cache_key = f"job_ranking:{company_id}:{job_embedding_id}"
        redis_client.delete(cache_key)

        logs_collection.insert_one({
            "application_id": application_id,
            "score": final_score,
            "n8n_sent": n8n_triggered,
            "timestamp": datetime.datetime.now(datetime.timezone.utc)
        })
        print(f"Processed resume for application {application_id} with score {final_score} and n8n_triggered={n8n_triggered}")
        return {
            "status": "success",
            "score": final_score,
            "auto_interview": n8n_triggered
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))