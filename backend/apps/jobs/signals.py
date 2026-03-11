# jobs/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Job
import requests
import os 
FASTAPI_URL = os.getenv("FASTAPI_URL")

@receiver(post_save, sender=Job)
def auto_approve_job(sender, instance: Job, created, **kwargs):
    print("this is activated ")
    # Only process newly created jobs and not already approved
    if created :
        payload = {
            "job_id": str(instance.id),
            "title": instance.title,
            "description": instance.description,
            "requirements": instance.requirements,
            "responsibilities": instance.responsibilities,
            "location": instance.location,
            "salary_min": str(instance.salary_min) if instance.salary_min else None,
            "salary_max": str(instance.salary_max) if instance.salary_max else None,
            "job_type": instance.job_type,
            "experience_required": instance.experience_required,
            "deadline": str(instance.deadline) if instance.deadline else None,
            
        }

        try:
            response = requests.post(f"{FASTAPI_URL}/process-job", json=payload, timeout=5)
            response.raise_for_status()
            result = response.json()
            
            # Check trust result from backend
            if result.get("trusted"):
                instance.is_approve = True
                instance.embedd_id = result.get("embedd_id")
                instance.save(update_fields=["is_approve","embedd_id"])
        except Exception as e:
            print(f"LLM verification failed for Job {instance.id}: {e}")


from .models import JobApplication


@receiver(post_save, sender=JobApplication)
def send_resume_for_ranking(sender, instance, created, **kwargs):
    """
    When a candidate applies, send their resume and the 
    Job's existing ChromaDB ID to FastAPI for embedding and ranking.
    """
    if created and instance.resume:
        # We need the embedd_id from the related Job model
        job_embedding_id = instance.job.embedd_id 
        
        if not job_embedding_id:
            print(f"Skipping: Job {instance.job.id} has no embedding ID yet.")
            return

        # Prepare the file and data
        files = {'file': instance.resume.open('rb')}
        data = {
            "applicant_id": str(instance.applicant.id),
            "job_embedding_id": job_embedding_id, # Link resume to this specific job
            "application_id": str(instance.id)
        }

        try:
            # Note: Using files= sends this as multipart/form-data
            response = requests.post(
                f"{FASTAPI_URL}/process-resume", 
                files=files, 
                data=data, 
                timeout=10
            )
            response.raise_for_status()
            print(f"Resume for application {instance.id} sent successfully.")
        except Exception as e:
            print(f"Failed to send resume to FastAPI: {e}")