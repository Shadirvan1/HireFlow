from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.accounts.models import Company, HRProfile, CandidateProfile
import datetime

User = get_user_model()

class HireFlowUserTests(TestCase):

    def test_create_user(self):
        """Test creating a user with email and username"""
        user = User.objects.create_user(
            email="test@hireflow.com",
            username="testuser",
            password="password123"
        )
        self.assertEqual(user.email, "test@hireflow.com")
        self.assertEqual(user.username, "testuser")
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_create_superuser(self):
        """Test creating a superuser"""
        admin = User.objects.create_superuser(
            email="admin@hireflow.com",
            username="adminuser",
            password="password123"
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertEqual(admin.role, "ADMIN")

    def test_user_email_normalized(self):
        """Test that email addresses are normalized (lowercase domain)"""
        email = "TEST@HIREFLOW.COM"
        user = User.objects.create_user(email, "password123", username="norm")
        self.assertEqual(user.email, "TEST@hireflow.com")

class CompanyAndProfileTests(TestCase):

    def setUp(self):
        # Setup data for reusable testing
        self.company = Company.objects.create(
            name="HireFlow Tech",
            industry="HR Tech",
            company_size="11-50",
            headquarters="India"
        )
        self.user = User.objects.create_user(
            email="hr@company.com",
            username="hr_manager",
            password="password123",
            role="HR"
        )

    def test_company_creation(self):
        """Test company model fields"""
        self.assertEqual(self.company.name, "HireFlow Tech")
        self.assertEqual(str(self.company.name), "HireFlow Tech")

    def test_hr_profile_linking(self):
        """Test that an HR Profile links correctly to User and Company"""
        hr_profile = HRProfile.objects.create(
            user=self.user,
            company=self.company,
            designation="Senior Recruiter",
            experience_years=5
        )
        self.assertEqual(hr_profile.user.email, "hr@company.com")
        self.assertEqual(hr_profile.company.name, "HireFlow Tech")
        self.assertEqual(self.user.hr_profile.designation, "Senior Recruiter")

    def test_candidate_profile_creation(self):
        """Test candidate profile details"""
        candidate_user = User.objects.create_user(
            email="candidate@hireflow.com",
            username="dev_candidate",
            password="password123"
        )
        profile = CandidateProfile.objects.create(
            user=candidate_user,
            first_name="John",
            last_name="Doe",
            current_location="Bangalore",
            total_experience=3.5
        )
        self.assertEqual(profile.user.email, "candidate@hireflow.com")
        self.assertEqual(str(profile), "candidate@hireflow.com - Candidate")

class UtilityModelTests(TestCase):

    def test_otp_expiry_logic(self):
        """Test the is_valid method of PhoneOTP"""
        from apps.accounts.models import PhoneOTP
        otp_entry = PhoneOTP.objects.create(phone_number="1234567890", otp="123456")
        
        # Should be valid right after creation
        self.assertTrue(otp_entry.is_valid())
        
        # Manually backdate the created_at to test expiry
        otp_entry.created_at = timezone.now() - datetime.timedelta(minutes=10)
        otp_entry.save()
        self.assertFalse(otp_entry.is_valid())