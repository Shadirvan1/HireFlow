from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.accounts.models import Company, HRProfile, CandidateProfile
import datetime
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model



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


class BaseTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="Test@123",
            is_verified=True,
            is_active=True
        )


class TestRegister(BaseTestCase):

    def test_register_success(self):
        url = "/api/v1/accounts/register/"

        data = {
            "email": "new@example.com",
            "password": "Test@123"
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
    
class TestRegister(BaseTestCase):

    def test_register_success(self):
        url = "/api/v1/accounts/register/"

        data = {
            "email": "new@example.com",
            "password": "Test@123"
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)

class TestLogin(BaseTestCase):

    def test_login_success(self):
        url = "/api/v1/accounts/login/"

        data = {
            "email": "test@example.com",
            "password": "Test@123"
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user", response.data)

    def test_login_wrong_password(self):
        url = "/api/v1/accounts/login/"

        data = {
            "email": "test@example.com",
            "password": "wrong"
        }

        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestResendEmail(BaseTestCase):

    def test_resend_email_success(self):
        self.user.is_verified = False
        self.user.save()

        url = "/api/v1/accounts/resend-email/"

        response = self.client.post(url, {"email": self.user.email})

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_resend_email_already_verified(self):
        url = "/api/v1/accounts/resend-email/"

        response = self.client.post(url, {"email": self.user.email})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class TestMeView(BaseTestCase):

    def test_me(self):
        self.client.force_authenticate(user=self.user)

        url = "/api/v1/accounts/me/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user_id"], self.user.id)

class TestMFA(BaseTestCase):

    def test_get_mfa_setup(self):
        self.client.force_authenticate(user=self.user)

        url = "/api/v1/accounts/mfa/setup/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("otp_uri", response.data)
    
class TestRefreshToken(BaseTestCase):

    def test_refresh_without_cookie(self):
        url = "/api/v1/accounts/token/refresh/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

from unittest.mock import patch

class TestGoogleAuth(BaseTestCase):

    @patch("google.oauth2.id_token.verify_oauth2_token")
    def test_google_login(self, mock_verify):
        mock_verify.return_value = {
            "email": "google@test.com",
            "given_name": "Test",
            "family_name": "User"
        }

        url = "/api/v1/accounts/google/"

        response = self.client.post(url, {"token": "fake-token"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)