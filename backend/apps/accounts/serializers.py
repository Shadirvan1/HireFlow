from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import CandidateProfile,HRProfile,Company
import re

from django.db.models import Q
User = get_user_model()


class SeekerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "email",
            "phone_number",
        ]


        def validate_username(self, value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Username already exists")
            if not re.match(r"^[a-zA-Z0-9_.-]+$", value):
                raise serializers.ValidationError("Username can only contain letters, numbers, and _ . -")
            if len(value) < 3:
                raise serializers.ValidationError("Username must be at least 3 characters long")
            return value
        def validate_email(self,value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Email already exists")
            return value

        def validate_phone(self,value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Phone number already exists")
            return value
        def validate_password(self, value):
            if len(value) < 8:
                raise serializers.ValidationError("Password must be at least 8 characters long")
            if value.isdigit():
                raise serializers.ValidationError("Password cannot be only numbers")
            if value.islower():
                raise serializers.ValidationError("Password must contain at least one uppercase letter")
            if value.isupper():
                raise serializers.ValidationError("Password must contain at least one lowercase letter")
            if not re.search(r"\d", value):
                raise serializers.ValidationError("Password must contain at least one number")
            if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
                raise serializers.ValidationError("Password must contain at least one special character (!@#$...)")
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

    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = CandidateProfile
        fields = [
            "id",
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
            raise serializers.ValidationError("First name must be at least 2 characters.")
        return value

    def validate_last_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Last name must be at least 2 characters.")
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
                raise serializers.ValidationError({
                    "expected_ctc": "Expected CTC cannot be less than current CTC."
                })

        dob = data.get("date_of_birth")
        if dob:
            if dob > date.today():
                raise serializers.ValidationError({
                    "date_of_birth": "Date of birth cannot be in future."
                })

        return data



class SeekerLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(
                email__iexact=email 
            )
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "email": "Invalid email or phone number"
            })

        if not user.check_password(password):
            raise serializers.ValidationError({
                "password": "Incorrect password"
            })
        if user.role == "ADMIN":
            pass
        else:
            if not user.is_verified:
                raise serializers.ValidationError({
                    "email": "Please verify your account first"
                })

        if not user.is_active:
            raise serializers.ValidationError({
                "email": "User is inactive. Contact admin."
            })

        attrs["user"] = user
        return attrs




class Hrserializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
                "username",
                "password",
                "email",
                "hr_password",
            ]
        def validate_username(self,value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Username already exists")
            return value
        def validate_email(self,value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Email already exists")
            return value


        def validate_password(self, value):
            if value.isdigit():
                raise serializers.ValidationError("Password cannot be only numbers.")
            if value.lower() == value:
                raise serializers.ValidationError("Password must contain uppercase letters.")
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
            "email",
            'name',
            'website',
            'industry',
            'company_size',
            'headquarters',
            'logo',
            'description',
            
        ]



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
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("Website must start with http:// or https://")
        return value

class HRProfileSerializer(serializers.ModelSerializer):
    user = Hrserializer(read_only=True)
    company = CompanySerializer(read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
 

    )


    class Meta:
        model = HRProfile
        fields = [
            'id','email', 'user', 'user_id', 'company', 
             'linkedin_url', 'designation', 'department', 'role',
            'hires_count', 'experience_years', 'receive_notifications',
            'profile_image', 'certifications',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'hires_count', 'created_at',
            'updated_at', 'user', 'company', 'role'
        ]




    def validate_linkedin_url(self, value):

        if value:
            if "linkedin.com" not in value:
                raise serializers.ValidationError(
                    "Enter a valid LinkedIn profile URL."
                )
        return value

    def validate_experience_years(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Experience cannot be negative."
            )
        if value > 60:
            raise serializers.ValidationError(
                "Experience value is unrealistic."
            )
        return value

    def validate_profile_image(self, value):

        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Profile image must be less than 5MB."
            )
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
    
import pyotp
    
from django.contrib.auth.hashers import check_password



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
            raise serializers.ValidationError({"email": "Please verify your account first"})

        attrs["user"] = user
        return attrs