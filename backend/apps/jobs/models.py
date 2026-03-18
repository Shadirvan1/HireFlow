import os
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from apps.accounts.models import CandidateProfile, Company

# ✅ Specialized storage for PDFs and Documents
from cloudinary_storage.storage import RawMediaCloudinaryStorage

User = get_user_model()

def job_application_resume_upload(instance, filename):
    """
    Cloudinary path: resumes/user_<user_id>/<uuid>
    Note: Cloudinary usually handles extensions automatically.
    """
    ext = os.path.splitext(filename)[1]
    user_id = "unknown"
    if instance.applicant and instance.applicant.user:
        user_id = instance.applicant.user.id
        
    # Return a path that Cloudinary will use as the Public ID
    return f"resumes/user_{user_id}/{uuid.uuid4()}{ext}"


class Job(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="posted_jobs"
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    responsibilities = models.TextField(blank=True, null=True)
    embedd_id = models.CharField(max_length=255, blank=True, null=True)

    location = models.CharField(max_length=255, blank=True, null=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    job_type = models.CharField(
        max_length=50,
        choices=[
            ("FULL_TIME", "Full Time"),
            ("PART_TIME", "Part Time"),
            ("INTERNSHIP", "Internship"),
            ("CONTRACT", "Contract"),
        ]
    )

    experience_required = models.IntegerField(default=0)
    deadline = models.DateField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_approve = models.BooleanField(default=False)
    is_automatic = models.BooleanField(default=False)
    ats_ascore = models.FloatField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class JobApplication(models.Model):
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    applicant = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="job_applications"
    )

    # ✅ Using RawMediaCloudinaryStorage for PDF/Docx files
    resume = models.FileField(
        upload_to=job_application_resume_upload, 
        storage=RawMediaCloudinaryStorage(),
        blank=True, 
        null=True
    )
    
    cover_letter = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=50,
        choices=[
            ("SCHEDULED", "Scheduled"),
            ("APPLIED", "Applied"),
            ("SHORTLISTED", "Shortlisted"),
            ("REJECTED", "Rejected"),
            ("HIRED", "Hired"),
        ],
        default="APPLIED"
    )
    
    scheduled_at = models.DateTimeField(null=True, blank=True)
    meeting_link = models.URLField(null=True, blank=True)
    interviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'applicant') 

    def __str__(self):
        return f"{self.applicant} - {self.job}"

class SavedJob(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="saved_jobs"
    )
    job = models.ForeignKey(
        Job, 
        on_delete=models.CASCADE, 
        related_name="saved_by_users"
    )
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Prevent a user from saving the same job multiple times
        unique_together = ('user', 'job')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.username} saved {self.job.title}"