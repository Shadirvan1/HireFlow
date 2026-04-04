import os
import re
from datetime import date, timezone

import pyotp
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Q
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from firebase_admin import auth as firebase_auth
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import serializers

from apps.accounts.services.mfa_service import enable_mfa

from .models import CandidateProfile, Company, HRProfile, Invite
from .services.mfa_service import disable_mfa, verify_otp
from .utilities import send_password_reset_email

User = get_user_model()


class SeekerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "email",
            "phone_number",
            "is_number_verified",
        ]
        read_only_fields = ["is_number_verified"]

        def validate_username(self, value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Username already exists")
            if not re.match(r"^[a-zA-Z0-9_.-]+$", value):
                raise serializers.ValidationError(
                    "Username can only contain letters, numbers, and _ . -"
                )
            if len(value) < 3:
                raise serializers.ValidationError(
                    "Username must be at least 3 characters long"
                )
            return value

        def validate_email(self, value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Email already exists")
            return value

        def validate_phone(self, value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Phone number already exists")
            return value

        def validate_password(self, value):
            if len(value) < 8:
                raise serializers.ValidationError(
                    "Password must be at least 8 characters long"
                )
            if value.isdigit():
                raise serializers.ValidationError("Password cannot be only numbers")
            if value.islower():
                raise serializers.ValidationError(
                    "Password must contain at least one uppercase letter"
                )
            if value.isupper():
                raise serializers.ValidationError(
                    "Password must contain at least one lowercase letter"
                )
            if not re.search(r"\d", value):
                raise serializers.ValidationError(
                    "Password must contain at least one number"
                )
            if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
                raise serializers.ValidationError(
                    "Password must contain at least one special character (!@#$...)"
                )
            return value

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        CandidateProfile.objects.create(user=user)
        return user


class CandidateProfileSerializer(serializers.ModelSerializer):
    user = SeekerSerializer(read_only=True)
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = CandidateProfile
        fields = [
            "id",
            "user",
            "first_name",
            "last_name",
            "date_of_birth",
            "current_location",
            "total_experience",
            "current_company",
            "current_ctc",
            "expected_ctc",
            "notice_period_days",
            "profile_image",
            "portfolio_url",
            "linkedin_url",
            "github_url",
            "receive_notifications",
        ]

    def validate_first_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError(
                "First name must be at least 2 characters."
            )
        return value

    def validate_last_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Last name must be at least 2 characters."
            )
        return value

    def validate_total_experience(self, value):
        if value < 0:
            raise serializers.ValidationError("Experience cannot be negative.")
        if value > 60:
            raise serializers.ValidationError("Experience seems invalid.")
        return value

    def validate_notice_period_days(self, value):
        if value < 0:
            raise serializers.ValidationError("Notice period cannot be negative.")
        return value

    def validate(self, data):
        current_ctc = data.get("current_ctc")
        expected_ctc = data.get("expected_ctc")

        if current_ctc and expected_ctc:
            if expected_ctc < current_ctc:
                raise serializers.ValidationError(
                    {"expected_ctc": "Expected CTC cannot be less than current CTC."}
                )

        dob = data.get("date_of_birth")
        if dob:
            age = (date.today() - dob).days // 365
            if age < 18:
                raise serializers.ValidationError(
                    {"date_of_birth": "You must be at least 18 years old to register."}
                )

        return data


class SeekerLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    otp = serializers.CharField(write_only=True, required=False, allow_blank=True)
    fcm_token = serializers.CharField(write_only=True, required=False, allow_null=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        otp = attrs.get("otp")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Invalid email"})

        if not user.check_password(password):
            raise serializers.ValidationError({"password": "Incorrect password"})

        if user.role != "ADMIN":
            if not user.is_verified:
                raise serializers.ValidationError(
                    {"email": "Please verify your account first"}
                )

            if not user.is_active:
                raise serializers.ValidationError({"email": "Please contact admin"})

        if user.mfa_enabled:
            if not otp:
                attrs["mfa_required"] = True
                attrs["user"] = user
                return attrs

            if not verify_otp(user, otp):
                raise serializers.ValidationError(
                    {"otp": "Invalid OTP. Please try again."}
                )

        attrs["mfa_required"] = False
        attrs["user"] = user
        return attrs


class Hrserializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "email",
            "hr_password",
        ]
        read_only_fields = ["id"]

        def validate_username(self, value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Username already exists")
            return value

        def validate_email(self, value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Email already exists")
            return value

        def validate_password(self, value):
            if value.isdigit():
                raise serializers.ValidationError("Password cannot be only numbers.")
            if value.lower() == value:
                raise serializers.ValidationError(
                    "Password must contain uppercase letters."
                )
            return value

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CompanySerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "email",
            "name",
            "website",
            "industry",
            "company_size",
            "headquarters",
            "logo",
            "description",
        ]
        read_only_fields = ["id"]

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name is required.")
        return value

    def validate_industry(self, value):
        if not value:
            raise serializers.ValidationError("Industry is required.")
        return value

    def validate_headquarters(self, value):
        if not value:
            raise serializers.ValidationError("Headquarters is required.")
        return value

    def validate_website(self, value):
        if value and not value.startswith(("http://", "https://")):
            raise serializers.ValidationError(
                "Website must start with http:// or https://"
            )
        return value


class HRProfileSerializer(serializers.ModelSerializer):
    user = Hrserializer(read_only=True)
    company = CompanySerializer(read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="user",
        write_only=True,
    )

    class Meta:
        model = HRProfile
        fields = [
            "id",
            "email",
            "user",
            "user_id",
            "company",
            "linkedin_url",
            "designation",
            "department",
            "role",
            "hires_count",
            "experience_years",
            "receive_notifications",
            "profile_image",
            "certifications",
            "created_at",
            "updated_at",
            "is_active",
        ]
        read_only_fields = [
            "id",
            "hires_count",
            "created_at",
            "isactive",
            "updated_at",
            "user",
            "company",
            "role",
        ]

    def validate_linkedin_url(self, value):

        if value:
            if "linkedin.com" not in value:
                raise serializers.ValidationError("Enter a valid LinkedIn profile URL.")
        return value

    def validate_experience_years(self, value):
        if value < 0:
            raise serializers.ValidationError("Experience cannot be negative.")
        if value > 60:
            raise serializers.ValidationError("Experience value is unrealistic.")
        return value

    def validate_profile_image(self, value):

        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Profile image must be less than 5MB.")
        return value

    def validate_certifications(self, value):

        if value and value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(
                "Certification file must be less than 10MB."
            )
        return value

    def validate(self, attrs):

        user = attrs.get("user")

        if user and HRProfile.objects.filter(user=user).exists():
            raise serializers.ValidationError(
                {"user_id": "HR profile already exists for this user."}
            )

        return attrs

    def create(self, validated_data):
        return HRProfile.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class HRLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    hr_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        hr_password = attrs.get("hr_password")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Invalid email"})

        if not user.check_password(password):
            raise serializers.ValidationError({"password": "Incorrect password"})

        if hr_password != user.hr_password:
            raise serializers.ValidationError({"hr_password": "Invalid HR password"})

        if not user.is_active:
            raise serializers.ValidationError({"email": "User is inactive"})

        if not user.is_verified:
            raise serializers.ValidationError(
                {"email": "Please verify your account first"}
            )

        attrs["user"] = user
        return attrs


class HRRegisterSerializer(serializers.ModelSerializer):

    email = serializers.EmailField()
    username = serializers.CharField(max_length=56)
    password = serializers.CharField(write_only=True, min_length=8)

    company_name = serializers.CharField(max_length=255)
    website = serializers.URLField(required=False, allow_blank=True)
    industry = serializers.CharField(max_length=255)
    company_size = serializers.CharField(max_length=100)
    headquarters = serializers.CharField(max_length=255)

    linkedin_url = serializers.URLField(required=False, allow_blank=True)
    designation = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(default=0)

    class Meta:
        model = User
        fields = [
            "email",
            "username",
            "password",
            "company_name",
            "website",
            "industry",
            "company_size",
            "headquarters",
            "linkedin_url",
            "designation",
            "department",
            "experience_years",
        ]

    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")

        return value

    def validate_username(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters.")

        return value.strip()

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value

    def validate_experience_years(self, value):
        if value < 0:
            raise serializers.ValidationError("Experience cannot be negative.")
        if value > 60:
            raise serializers.ValidationError("Invalid experience value.")
        return value

    def validate(self, attrs):

        company_name = attrs.get("company_name").strip()

        if not company_name:
            raise serializers.ValidationError(
                {"company_name": "Company name is required."}
            )

        industry = attrs.get("industry")
        if not industry:
            raise serializers.ValidationError({"industry": "Industry is required."})

        return attrs

    @transaction.atomic
    def create(self, validated_data):

        company_data = {
            "name": validated_data.pop("company_name").strip(),
            "website": validated_data.pop("website", ""),
            "industry": validated_data.pop("industry"),
            "company_size": validated_data.pop("company_size"),
            "headquarters": validated_data.pop("headquarters"),
        }

        hr_data = {
            "linkedin_url": validated_data.pop("linkedin_url", ""),
            "designation": validated_data.pop("designation", ""),
            "department": validated_data.pop("department", ""),
            "experience_years": validated_data.pop("experience_years", 0),
        }

        password = validated_data.pop("password")

        user = User.objects.create(role="HR", is_verified=False, **validated_data)
        user.set_password(password)
        user.save()

        company, created = Company.objects.get_or_create(
            name=company_data["name"], defaults=company_data
        )

        HRProfile.objects.create(user=user, company=company, role="HR", **hr_data)

        return user


class InviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invite
        fields = ["email", "role", "company", "expires_at"]


class ResendEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        email = data.get("email")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Email is invalid"})

        if user.is_verified:
            raise serializers.ValidationError({"email": "Email is already verified"})

        data["user"] = user
        return data


class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField(required=False)
    credential = serializers.CharField(required=False)

    def validate(self, data):
        token = data.get("token") or data.get("credential")

        if not token:
            raise serializers.ValidationError({"error": "No token provided"})

        google_id = os.getenv("GOOGLE_AUTH_CLIENT_ID")

        try:
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), google_id
            )
        except ValueError as e:
            print(f"Google Auth Validation Error: {e}")
            raise serializers.ValidationError({"error": "Token verification failed"})

        email = idinfo.get("email")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        if not email:
            raise serializers.ValidationError({"error": "Invalid token"})

        data["email"] = email
        data["first_name"] = first_name
        data["last_name"] = last_name

        return data

    def create(self, validated_data):
        email = validated_data["email"]
        first_name = validated_data["first_name"]
        last_name = validated_data["last_name"]

        user, created = User.objects.get_or_create(
            email=email, defaults={"username": first_name, "is_verified": True}
        )

        if created:
            user.set_unusable_password()
            user.save()

            CandidateProfile.objects.create(
                user=user, first_name=first_name, last_name=last_name
            )

        return user


class DisableMFASerializer(serializers.Serializer):
    otp = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        otp = attrs.get("otp")

        if not user.mfa_enabled:
            raise serializers.ValidationError({"detail": "MFA is not enabled"})

        if not disable_mfa(user, otp):
            raise serializers.ValidationError({"otp": "Invalid OTP"})

        return attrs


class EnableMFASerializer(serializers.Serializer):
    otp = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        otp = attrs.get("otp")

        if user.mfa_enabled:
            raise serializers.ValidationError({"detail": "MFA already enabled"})

        if not enable_mfa(user, otp):
            raise serializers.ValidationError({"otp": "Invalid OTP"})

        return attrs


class FirebaseVerifySerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)

    def validate_id_token(self, value):
        try:
            decoded_token = firebase_auth.verify_id_token(value)
        except Exception:
            raise serializers.ValidationError("Invalid Firebase token")

        self.context["decoded_token"] = decoded_token
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        decoded_token = self.context.get("decoded_token")

        phone_number = decoded_token.get("phone_number")

        user.phone_number = phone_number
        user.is_number_verified = True
        user.save()

        return user


class RegisterViaInviteSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        token = self.context.get("token")

        invite = Invite.objects.filter(
            token=token, is_used=False, expires_at__gte=timezone.now()
        ).first()

        if not invite:
            raise serializers.ValidationError("Invalid or expired invite")

        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Email already exists"})

        self.context["invite"] = invite
        return attrs

    def create(self, validated_data):
        invite = self.context.get("invite")

        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]

        user = User.objects.create_user(
            email=email,
            password=password,
            username=username,
            role="HR" if invite.role == "HR" else "INTERVIEWER",
            is_hr=True,
            is_verified=True,
        )

        HRProfile.objects.create(
            user=user,
            company=invite.company,
            role="HR" if invite.role == "HR" else "INTERVIEWER",
        )

        invite.is_used = True
        invite.save()

        return {"user": user, "company": invite.company.name, "role": invite.role}


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        uid = attrs.get("uid")
        token = attrs.get("token")

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except Exception:

            raise serializers.ValidationError({"error": "Invalid link"})

        if not PasswordResetTokenGenerator().check_token(user, token):
            raise serializers.ValidationError({"error": "Token invalid or expired"})

        self.context["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.context.get("user")
        password = self.validated_data.get("password")

        user.set_password(password)
        user.save()

        return user


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """
        We don't raise error if user doesn't exist
        (security best practice: avoid email enumeration)
        """
        try:
            user = User.objects.get(email=value)
            self.context["user"] = user
        except User.DoesNotExist:
            self.context["user"] = None

        return value

    def save(self, **kwargs):
        user = self.context.get("user")

        if user:
            print("worked")
            send_password_reset_email.delay(user.id)

        return True


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "New passwords do not match."}
            )

        if data["old_password"] == data["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "New password cannot be the same as the old password."}
            )

        return data


class DeleteAccountRequestSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        user = self.context["request"].user

        # Verify password is correct
        if not user.check_password(value):
            raise serializers.ValidationError("Incorrect password.")

        return value


class DeleteAccountConfirmSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6, min_length=6, write_only=True)

    def validate_otp(self, value):
        user = self.context["request"].user
        cache_key = f"delete_account_otp_{user.id}"

        stored_otp = cache.get(cache_key)

        if not stored_otp:
            raise serializers.ValidationError(
                "OTP has expired. Please request a new one."
            )

        if stored_otp != value:
            raise serializers.ValidationError("Invalid OTP.")

        return value
