from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth import get_user_model
from apps.accounts.models import CandidateProfile,Company
User = get_user_model()

class Job(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="posted_jobs"
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField()
    responsibilities = models.TextField(blank=True, null=True)

    location = models.CharField(max_length=255,blank=True,null=True)
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

    resume = models.FileField(upload_to="resumes/")
    cover_letter = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=50,
        choices=[
            ("PENDING", "Pending"),
            ("SHORTLISTED", "Shortlisted"),
            ("REJECTED", "Rejected"),
            ("HIRED", "Hired"),
        ],
        default="PENDING"
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'applicant') 

    def __str__(self):
        return f"{self.applicant} - {self.job}"
