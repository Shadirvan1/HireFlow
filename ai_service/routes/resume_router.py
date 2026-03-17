from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid
import datetime
from io import BytesIO
import requests
import os
import asyncio
from database.mongo_client import logs_collection
from services.resume_parser import extract_text_from_bytes
from services.embedding import generate_embedding
from vector_db.chroma_client import resume_collection
from storages.minio_client import minio_client, BUCKET_NAME
from services.chunker import chunk_text
from database.redis_client import redis_client
from utilities.ranking_utility import rank_single_candidate

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
    object_name = f"resumes/{company_id}/{job_embedding_id}/{file_id}.pdf" 
    content = await file.read()
    
    try:
        print(f"--- Starting Processing for App: {application_id} ---")

        # 1. MinIO Upload (Standard logic)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: minio_client.put_object(
            BUCKET_NAME, object_name, data=BytesIO(content),
            length=len(content), content_type=file.content_type
        ))

        # 2. Text Extraction & Chunking
        text = extract_text_from_bytes(content)
        chunks = chunk_text(text)
        print(f"Extracted text and generated {len(chunks)} chunks.")

        # 3. Embedding & ChromaDB Storage (THE CRITICAL FIX)
        print("Generating embeddings and storing in ChromaDB...")
        embeddings = [generate_embedding(chunk) for chunk in chunks]
        
        # Create unique IDs for each chunk
        chunk_ids = [f"{application_id}_chunk_{i}" for i in range(len(chunks))]
        
        # Create metadata for each chunk (Ensures 'where' filter works)
        metadatas = [{
            "application_id": str(application_id), 
            "company_id": str(company_id),
            "job_id": str(job_embedding_id)
        } for _ in range(len(chunks))]

        # Atomic Add to Chroma
        resume_collection.add(
            ids=chunk_ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )

        # 4. Ranking (Now data exists in DB)
        print(f"Start ranking for {application_id}...")
        ranking_result = await rank_single_candidate(
            application_id=str(application_id),
            job_id=str(job_embedding_id),
            company_id=str(company_id)
        )

        final_score = ranking_result.get("final_score", 0) if ranking_result else 0
        print(f"Ranking complete. Score: {final_score}")

        # 5. TRIGGER n8n AUTOMATION
        n8n_triggered = False
        if is_automatic == "True" and final_score >= ats_score_threshold:
            N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
            N8N_PASS = os.getenv("N8N_PASS")
            
            payload = {
                "application_id": application_id,
                "candidate_email": candidate_email,
                "hr_email": hr_email,
                "job_title": job_title,
                "ats_score": round(final_score, 2)
            }
            
            headers = {"X-N8N-API-KEY": N8N_PASS}
            
            try:
                # Run n8n request in executor to avoid blocking the main thread
                print(f"Triggering n8n at {N8N_WEBHOOK_URL}...")
                await loop.run_in_executor(None, lambda: requests.post(
                    N8N_WEBHOOK_URL, json=payload, headers=headers, timeout=5
                ))
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
    
        return {
            "status": "success",
            "application_id": application_id,
            "score": final_score,
            "auto_interview": n8n_triggered
        }

    except Exception as e:
        print(f"FATAL ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/resume-data")
async def get_all_resume_data():
    try:
        results = resume_collection.get(include=["documents", "metadatas"])
        metadatas = results.get("metadatas") or []

        # FIX: Filter out None values before sorting
        stored_apps = sorted(list(set(
            str(m.get("application_id")) for m in metadatas 
            if m and m.get("application_id") is not None
        )))
        
        return {
            "total_records": len(results.get("ids", [])),
            "stored_application_ids": stored_apps,
            "count_per_app": {app: sum(1 for m in metadatas if m and str(m.get("application_id")) == app) for app in stored_apps}
        }
    except Exception as e:
        print(f"Debug error: {e}")
        return {"error": str(e)}