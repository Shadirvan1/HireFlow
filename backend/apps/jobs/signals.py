# jobs/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Job
import requests
import os 
from lambda_push.notification_service import send_notification
from apps.accounts.models import HRProfile

FASTAPI_URL = os.getenv("FASTAPI_URL")
@receiver(post_save, sender=Job)
def auto_approve_job(sender, instance: Job, created, **kwargs):
    hr_profile = HRProfile.objects.filter(company=instance.company).first()
    company_user = hr_profile.user if hr_profile else None
    
    
    print("this is activated")

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
                timeout=10
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
                    data={
                        "type": "job_approved",
                        "job_id": str(instance.id)
                    }
                )

                print("completed")
            else:

                send_notification(
                    user=company_user,
                    title="Job Rejected ❌",
                    body="AI rejected your job post due to policy or content issues.",
                    data={
                        "type": "job_rejected",
                        "job_id": str(instance.id)
                    }
                )


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
        
        # Get company_id from the related job
        company_id = str(instance.job.company.id) if hasattr(instance.job, 'company') else "unknown"
        
        if not job_embedding_id:
            print(f"Skipping: Job {instance.job.id} has no embedding ID yet.")
            return

        # Prepare the file and data
        files = {'file': instance.resume.open('rb')}
        data = {
            "applicant_id": str(instance.applicant.id),
            "job_embedding_id": job_embedding_id, # Link resume to this specific job
            "application_id": str(instance.id),
            "company_id": company_id
            

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