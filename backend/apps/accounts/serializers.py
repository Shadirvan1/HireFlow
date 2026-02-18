from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import CandidateProfile,HRProfile
import re
User = get_user_model()


class SeekerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "password",
            "email",
            "phone",
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
class Hrserializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
                "username",
                "password",
                "email",
                "hr_password",
                "phone",
            ]
        def validate_username(self,value):
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Username already exists")
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

class SeekerLoginSerializer(serializers.Serializer):
    phone_email = serializers.CharField()
    password = serializers.CharField()


        