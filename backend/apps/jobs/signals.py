from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings  
import requests
import os 
from .models import Job, JobApplication
from lambda_push.notification_service import send_notification
from apps.accounts.models import HRProfile
from django.conf import settings

FASTAPI_URL = settings.FASTAPI_URL

def get_auth_headers():
    return {
        "X-API-KEY": settings.SECRET_KEY,
    
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
           
            response = requests.post(
                f"{FASTAPI_URL}/process-job",
                json=payload,
                headers=get_auth_headers(), 
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            print(result)

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


            
from utils.cloudinary_storage import get_signed_resume_url
import requests

@receiver(post_save, sender=JobApplication)
def send_resume_for_ranking(sender, instance, created, **kwargs):

    if not created or not instance.resume:
        return

    job = instance.job

    if not job.embedd_id:
        return

    try:
        candidate_email = (
            instance.applicant.user.email
            if instance.applicant and instance.applicant.user
            else "unknown"
        )

        interviewer_email = job.user.email if job.user else "admin@company.com"

        data = {
            "application_id": str(instance.id),
            "job_embedding_id": job.embedd_id,
            "company_id": str(job.company.id),
            "is_automatic": str(job.is_automatic),
            "ats_score_threshold": str(job.ats_ascore),
            "job_title": job.title,
            "candidate_email": candidate_email,
            "hr_email": interviewer_email,
        }


        signed_url = get_signed_resume_url(instance)
        file_response = requests.get(signed_url, timeout=10)
        file_response.raise_for_status()

        files = {
            'file': (instance.resume.name, file_response.content)
        }


        response = requests.post(
            f"{FASTAPI_URL}/process-resume",
            files=files,
            data=data,
            headers=get_auth_headers(),
            timeout=20  
        )

        response.raise_for_status()
        print(f"✅ Application {instance.id} processed successfully")

    except Exception as e:
        print(f"❌ Signal Error: {e}")