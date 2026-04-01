import os
from datetime import timedelta
import random
from django.core.cache import cache
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.utils import timezone
from django.contrib.auth import get_user_model, login
from django.contrib.auth.tokens import default_token_generator, PasswordResetTokenGenerator
from django.contrib.auth import update_session_auth_hash
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from firebase_admin import messaging, auth as firebase_auth

from .models import CandidateProfile, HRProfile, Invite, Company
from .serializers import (
    SeekerSerializer,
    SeekerLoginSerializer,
    CandidateProfileSerializer,
    HRRegisterSerializer,
    ResendEmailSerializer,
    GoogleAuthSerializer,
    DisableMFASerializer,
    EnableMFASerializer,
    Hrserializer,
    HRProfileSerializer,
    FirebaseVerifySerializer,
    RegisterViaInviteSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
    DeleteAccountConfirmSerializer,
    DeleteAccountRequestSerializer


)

from .utilities import send_verification_email,send_delete_account_otp
from .services.jwt_service import create_tokens_for_user, set_tokens_in_response, refresh_tokens
from .services.mfa_service import (
    generate_mfa_secret,
    get_provisioning_uri,
    enable_mfa,
    disable_mfa,
    verify_otp
)

from lambda_push.notification_service import send_notification
from lambda_push.lambda_function import initialize_firebase
from django.db import transaction
import firebase_config

User = get_user_model()
FRONT_END_URL = os.getenv("FRONT_END_URL")


class SeekerRegisterView(views.APIView):
    permission_classes = [AllowAny]
    serializer_class = SeekerSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if not user.is_verified:
                send_verification_email.delay(user.id)
               
            return Response(
                {
                    "message": "Activation link sent successfully.",
                    "user": {"id": str(user.id), "email": user.email}
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendEmailLinkView(views.APIView):
    permission_classes = [AllowAny]
    serializer_class = ResendEmailSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        send_verification_email.apply_async(
            args=[user.id],    
            countdown=2,
        )

        return Response(
            {"message": "Verification link sent successfully"},
            status=status.HTTP_200_OK
        )


class CandidateProfileView(views.APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CandidateProfileSerializer

    def get(self, request, version):
        profile = request.user.candidate_profile
        serializer = self.serializer_class(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, version):
        profile = request.user.candidate_profile
        serializer = self.serializer_class(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Profile updated successfully", "data": serializer.data},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HRRegisterView(views.APIView):
    permission_classes = [AllowAny]
    serializer_class = HRRegisterSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "Registration successful. Please login.",
                "user": {"id": str(user.id), "email": user.email}
            },
            status=status.HTTP_200_OK
        )


class VerifyEmailView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, version, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_verified = True
                user.save()
                return Response({"message": "Email verified successfully!"})

            if user.is_verified:
                return Response({"message": "Already verified"}, status=status.HTTP_200_OK)

            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"error": "Invalid link"}, status=status.HTTP_400_BAD_REQUEST)


class GoogleAuthenticationView(views.APIView):
    permission_classes = [AllowAny]
    serializer_class = GoogleAuthSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save(is_verified=True)

        tokens = create_tokens_for_user(user)

        response = Response(
            {
                "detail": "Login successful",
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "role": user.role
                }
            },
            status=status.HTTP_200_OK
        )

        return set_tokens_in_response(response, tokens)

class LoginView(views.APIView):
    permission_classes = [AllowAny]
    serializer_class = SeekerLoginSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        mfa_required = serializer.validated_data.get("mfa_required", False)


        if mfa_required:
            return Response(
                {"mfa_required": True},
                status=status.HTTP_200_OK 
            )

        if user.role == "HR" and not user.is_hr:
            return Response(
                {"error": "Please contact admin"},
                status=status.HTTP_400_BAD_REQUEST
            )

        fcm_token = serializer.validated_data.get("fcm_token")
        if fcm_token:
            user.fcm_token = fcm_token
            user.save(update_fields=["fcm_token"])

        tokens = create_tokens_for_user(user)

        response = Response(
            {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                }
            },
            status=status.HTTP_200_OK
        )

        return set_tokens_in_response(response, tokens)


class SetupMFAView(views.APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EnableMFASerializer

    def get(self, request, version):
        user = request.user

        if user.mfa_enabled:
            return Response(
                {
                    "message": "MFA already enabled",
                    "mfa_enabled": True
                },
                status=status.HTTP_200_OK
            )

        generate_mfa_secret(user)
        otp_uri = get_provisioning_uri(user)

        return Response(
            {
                "secret": user.mfa_secret,
                "otp_uri": otp_uri,
                "mfa_enabled": False
            },
            status=status.HTTP_200_OK
        )

    def post(self, request, version):
        serializer = self.serializer_class(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        return Response(
            {"message": "MFA successfully enabled"},
            status=status.HTTP_200_OK
        )

class DisableMFAView(views.APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DisableMFASerializer

    def post(self, request, version):
        serializer = self.serializer_class(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        return Response(
            {"message": "MFA disabled successfully"},
            status=status.HTTP_200_OK
        )

class Me(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, version):
        user = request.user
        return Response(
            {"user_id": user.id, "role": user.role},
            status=status.HTTP_200_OK
        )


class RefreshTokenView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request, version):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            tokens = refresh_tokens(refresh_token)
            response = Response({"message": "Access token refreshed"}, status=status.HTTP_200_OK)
            return set_tokens_in_response(response, tokens)
        except TokenError:
            response = Response(
                {"error": "Invalid or expired refresh token"},
                status=status.HTTP_401_UNAUTHORIZED
            )
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")
            return response


class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, version):
        refresh_token = request.COOKIES.get("refresh_token")
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass

        response.delete_cookie("refresh_token")
        response.delete_cookie("access_token")
        return response

class ForgotPasswordView(views.APIView):
    def post(self, request, version):
        serializer = ForgotPasswordSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "If email exists, reset link sent."
            })

        return Response(serializer.errors, status=400)


class ResetPasswordView(views.APIView):
    def post(self, request, version):
        serializer = ResetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password reset successful"})

        return Response(serializer.errors, status=400)



class InviteUserView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, version, role):

        role = role.upper()

        if role not in ["HR", "INTERVIEWER"]:
            return Response({"error": "Invalid role"}, status=400)

       
        try:
            company = request.user.hr_profile.company
        except:
            return Response({"error": "No company attached"}, status=400)

        invite = Invite.objects.create(
            company=company,
            role=role,
            expires_at=timezone.now() + timedelta(days=3)
        )

        invite_link = f"{FRONT_END_URL}/register/{invite.token}"

        return Response({
            "invite_link": invite_link,
            "role": role
        }, status=201)

class RegisterViaInviteView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request, version, token):
        serializer = RegisterViaInviteSerializer(
            data=request.data,
            context={"token": token}
        )

        if serializer.is_valid():
            data = serializer.save()
            return Response({
                "message": "Registration successful",
                "company": data["company"],
                "role": data["role"]
            }, status=201)

        return Response(serializer.errors, status=400)
    

class FirebaseVerifyView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, version):
        serializer = FirebaseVerifySerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Phone verified successfully"})

        return Response(serializer.errors, status=400)

class HRProfileDetailView(views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self, user):
        try:
            return HRProfile.objects.get(user=user)
        except HRProfile.DoesNotExist:
            return None

    def get(self, request, *args, **kwargs):
        profile = self.get_object(request.user)
        if not profile:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = HRProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        profile = self.get_object(request.user)
        if not profile:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = HRProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            update_session_auth_hash(request, user)
            
            return Response(
                {"message": "Password updated successfully."}, 
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountRequestView(views.APIView):
    """
    Step 1 — Verify password and send OTP to email.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, version):
        serializer = DeleteAccountRequestSerializer(
            data=request.data,
            context={"request": request}
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Password is correct — send OTP via Celery
        send_delete_account_otp.delay(
            user_id=request.user.id,
            username=request.user.username,
            email=request.user.email
        )

        return Response(
            {"message": "OTP sent to your email. Valid for 5 minutes."},
            status=status.HTTP_200_OK
        )


class DeleteAccountConfirmView(views.APIView):
    """
    Step 2 — Verify OTP and permanently delete account.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, version):
        serializer = DeleteAccountConfirmSerializer(
            data=request.data,
            context={"request": request}
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        
        cache_key = f"delete_account_otp_{user.id}"
        cache.delete(cache_key)

        
        user.delete()

        response = Response(
            {"message": "Account permanently deleted."},
            status=status.HTTP_200_OK
        )
        response.delete_cookie("access_token")  
        return response