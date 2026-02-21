from django.db import models
from django.contrib.auth.models import AbstractBaseUser , BaseUserManager,PermissionsMixin
from django.utils import timezone
import uuid
import os
import pyotp
class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "ADMIN")

        return self.create_user(email, password, **extra_fields)

def company_logo_upload(instance, filename):
    ext = os.path.splitext(filename)[1]
    return f"company/logos/{uuid.uuid4()}{ext}"


def hr_profile_image_upload(instance, filename):
    ext = os.path.splitext(filename)[1]
    user_id = instance.user.id if instance.user else "unknown"
    return f"hr_profiles/user_{user_id}/{uuid.uuid4()}{ext}"


def hr_certification_upload(instance, filename):
    ext = os.path.splitext(filename)[1]
    user_id = instance.user.id if instance.user else "unknown"
    return f"hr_certifications/user_{user_id}/{uuid.uuid4()}{ext}"


def candidate_profile_image_upload(instance, filename):
    ext = os.path.splitext(filename)[1]
    user_id = instance.user.id if instance.user else "unknown"
    return f"candidate_profile/user_{user_id}/{uuid.uuid4()}{ext}"







class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ("CANDIDATE", "Candidate"),
        ("INTERVIEWER", "Interviewer"),
        ("ADMIN", "Admin"),
        ("HR", "HR"),
    )

    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=255, blank=True, null=True)

    def generate_mfa_secret(self):
        self.mfa_secret = pyotp.random_base32()
        self.save()

    username = models.CharField(max_length=56)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20,blank=True,null=True)
    hr_password = models.CharField(max_length=256,blank=True,null=True)
    is_number_verified = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES,default="CANDIDATE")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    verify_link = models.CharField(max_length=256,blank=True,null=True)
    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class Company(models.Model):
    name = models.CharField(max_length=255)
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=255)
    company_size = models.CharField(max_length=100)
    headquarters = models.CharField(max_length=255)


    logo = models.ImageField(upload_to=company_logo_upload, null=True, blank=True)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

class HRProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="hr_profile",blank=True,null=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="hr_members", blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=50, blank=True, null=True)
    ROLE_CHOICES = [('recruiter', 'Recruiter'), ('manager', 'HR Manager'), ('admin', 'Admin')]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    profile_image = models.ImageField(upload_to=hr_profile_image_upload, blank=True, null=True)
    certifications = models.FileField(upload_to=hr_certification_upload, blank=True, null=True)
 
    hires_count = models.PositiveIntegerField(default=0)
    experience_years = models.PositiveIntegerField(default=0)
    
    receive_notifications = models.BooleanField(default=True)    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}"

class CandidateProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="candidate_profile"
    )

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)

    date_of_birth = models.DateField(null=True, blank=True)

    current_location = models.CharField(max_length=255)

    total_experience = models.FloatField(default=0.0)

    current_company = models.CharField(max_length=255, blank=True, null=True)
    current_ctc = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    expected_ctc = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    notice_period_days = models.IntegerField(default=0)
    profile_image = models.ImageField(upload_to=candidate_profile_image_upload, blank=True, null=True)

    portfolio_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    receive_notifications = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - Candidate"



