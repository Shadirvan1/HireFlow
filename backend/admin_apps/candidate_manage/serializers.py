from rest_framework import serializers

from apps.accounts.models import CandidateProfile, Company, HRProfile, Invite, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "role",
            "is_active",
            "is_verified",
            "is_hr",
            "mfa_enabled",
            "date_joined",
        ]
        read_only_fields = ["date_joined"]


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = "__all__"


class HRProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)
    company_name = serializers.ReadOnlyField(source="company.name")

    class Meta:
        model = HRProfile
        fields = "__all__"


class CandidateProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)

    class Meta:
        model = CandidateProfile
        fields = "__all__"


class InviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invite
        fields = "__all__"
