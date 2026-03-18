# jobs/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings  # <--- Add this
import requests
import os 
from .models import Job, JobApplication
from lambda_push.notification_service import send_notification
from apps.accounts.models import HRProfile

FASTAPI_URL = os.getenv("FASTAPI_URL")

# Define the common headers here
def get_auth_headers():
    return {
        "X-API-KEY": settings.SECRET_KEY,
        # Note: Do NOT add 'Content-Type' here if you are sending 'files=' 
        # because requests adds the boundary automatically.
    }

@receiver(post_save, sender=Job)
def auto_approve_job(sender, instance: Job, created, **kwargs):
    hr_profile = HRProfile.objects.filter(company=instance.company).first()
    company_user = hr_profile.user if hr_profile else None
    
    if created:
        company_id = str(instance.company.id) if hasattr(instance, 'company') else "unknown"

        payload = {
            "job_id": str(instance.id),
            "title": instance.title,
            "company_id": company_id,
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
            print(FASTAPI_URL)
            # --- ADDED HEADERS HERE ---
            response = requests.post(
                f"{FASTAPI_URL}/process-job",
                json=payload,
                headers=get_auth_headers(), 
                timeout=30
            )
            response.raise_for_status()
            result = response.json()

            if result.get("trusted"):
                instance.is_approve = True
                instance.embedd_id = result.get("embedd_id")
                instance.save(update_fields=["is_approve", "embedd_id"])
                
                send_notification(
                    user=company_user,
                    title="Job Approved ✅",
                    body="Your job application was posted successfully.",
                    data={"type": "job_approved", "job_id": str(instance.id)}
                )
            else:
                send_notification(
                    user=company_user,
                    title="Job Rejected ❌",
                    body="AI rejected your job post.",
                    data={"type": "job_rejected", "job_id": str(instance.id)}
                )

        except Exception as e:
            print(f"LLM verification failed for Job {instance.id}: {e}")

@receiver(post_save, sender=JobApplication)
def send_resume_for_ranking(sender, instance, created, **kwargs):
    print(f"Processing resume for application {instance.id}")
    if created and instance.resume:
        job = instance.job
        print(job.user.email)
        print(f"Job {job.id} has embedd_id: {job.embedd_id}")
        
        if not job.embedd_id:
            print(f"Job {job.id} does not have an embedding ID. Skipping AI processing.")
            return
        print(f"Preparing to send resume for application {instance.id} to AI service...")
        print(instance.applicant.user.email)
        candidate_email = instance.applicant.user.email if instance.applicant and instance.applicant.user else "unknown"
        print(f"Candidate email: {candidate_email}")
        interviewer_email = job.user.email if job.user else "admin@company.com"
        data = {

            "application_id": str(instance.id),
            "job_embedding_id": job.embedd_id,
            "company_id": str(job.company.id) if job.company else "unknown",
            "is_automatic": str(job.is_automatic),
            "ats_score_threshold": str(job.ats_ascore),
            "job_title": job.title,
            "candidate_email": candidate_email,
            "hr_email": interviewer_email
        }
        print(interviewer_email)
        print(f"Data prepared for AI service: {data}")
        files = {'file': instance.resume.open('rb')}
        print(f"File {instance.resume.name} opened for reading.")
        try:
            print(f"Sending request to AI service for application {instance.id}")
            response = requests.post(
                f"{FASTAPI_URL}/process-resume", 
                files=files, 
                data=data, 
                headers=get_auth_headers(),
                timeout=15 
            )
            response.raise_for_status()
            print(f"✅ App {instance.id} sent with Auth Header.")
        except Exception as e:
            print(f"❌ Signal Error: {e}")