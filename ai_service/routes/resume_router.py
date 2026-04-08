from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid
import datetime
import os
import asyncio
import cloudinary
import cloudinary.uploader
from services.resume_parser import extract_text_from_bytes
from services.embedding import generate_embedding
from vector_db.chroma_client import resume_collection
from utilities.celery_n8n_call import trigger_n8n_webhook_task
from services.chunker import chunk_text
from database.redis_client import redis_client
from utilities.ranking_utility import rank_single_candidate
import requests

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
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
        print(f"[ERROR] Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_id = str(uuid.uuid4())
    public_id = f"resumes/{company_id}/{job_embedding_id}/{file_id}"
    
    content = await file.read()
    
    try:
       
        loop = asyncio.get_event_loop()
        upload_result = await loop.run_in_executor(None, lambda: cloudinary.uploader.upload(
            content,
            public_id=public_id,
            folder="hireflow/resumes",
            resource_type="raw"  
        ))
        resume_url = upload_result.get("secure_url")

       
        text = extract_text_from_bytes(content)
        chunks = chunk_text(text)
        
        embeddings = [generate_embedding(chunk) for chunk in chunks]
        
       
        chunk_ids = [f"{application_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [{
            "application_id": str(application_id), 
            "company_id": str(company_id),
            "job_id": str(job_embedding_id),
            "resume_url": resume_url  
        } for _ in range(len(chunks))]

        resume_collection.add(
            ids=chunk_ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
       
        ranking_result = await rank_single_candidate(
            application_id=str(application_id),
            job_id=str(job_embedding_id),
            company_id=str(company_id)
        )
        final_score = ranking_result.get("final_score", 0) if ranking_result else 0
        
        
        if is_automatic == "True" and final_score >= ats_score_threshold:
            webhook_payload = {
                "application_id": application_id,
                "candidate_email": candidate_email,
                "hr_email": hr_email,
                "job_title": job_title,
                "ats_score": round(float(final_score), 2),
                "resume_url": resume_url
            }

            task_result = trigger_n8n_webhook_task.apply_async(args=[webhook_payload], connect_timeout=5)
        else:
            print(f"Skipping webhook (Auto: {is_automatic}, Score: {final_score})")

        
        cache_key = f"job_ranking:{company_id}:{job_embedding_id}"
        redis_client.delete(cache_key)
        
        return {
            "status": "success",
            "application_id": application_id,
            "score": final_score,
            "resume_url": resume_url
        }

    except Exception as e:
        print(f"[FATAL ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))