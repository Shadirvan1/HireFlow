# accounts/views.py
import os
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth import get_user_model, login
from django.contrib.auth.tokens import default_token_generator, PasswordResetTokenGenerator
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import pyotp
from .serializers import (
    SeekerSerializer,  SeekerLoginSerializer,
    CandidateProfileSerializer,
)
from .models import CandidateProfile, HRProfile
from .utilities import send_verification_email, send_password_reset_email
from .services.jwt_service import create_tokens_for_user, set_tokens_in_response, refresh_tokens
from .services.mfa_service import generate_mfa_secret, get_provisioning_uri, enable_mfa, disable_mfa

User = get_user_model()


class SeekerRegisterView(views.APIView):
    permission_classes = [AllowAny]
    serializer_class = SeekerSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if not user.is_verified:
                send_verification_email(user)
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

    def post(self, request, version):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Please provide email"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Email is invalid"}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_verified:
            return Response({"error": "Email is already verified"}, status=status.HTTP_400_BAD_REQUEST)

        send_verification_email(user)
        return Response({"message": "Verification link sent successfully"}, status=status.HTTP_200_OK)


class CandidateProfileView(views.APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CandidateProfileSerializer

    def get(self, request, version):
        profile = request.user.candidate_profile
        serializer = self.serializer_class(profile)
        return Response(serializer.data)

    def put(self, request, version):
        profile = request.user.candidate_profile
        serializer = self.serializer_class(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully", "data": serializer.data})
        return Response(serializer.errors, status=400)



from .serializers import HRRegisterSerializer

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
            status=status.HTTP_201_CREATED
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

    def post(self, request, version):
        token = request.data.get("token") or request.data.get("credential")
        if not token:
            return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)

        google_id = os.getenv("GOOGLE_CLIENT_ID")
        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), google_id)
        except ValueError:
            return Response({"error": "Token verification failed"}, status=status.HTTP_400_BAD_REQUEST)

        email = idinfo.get("email")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")

        if not email:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email=email, defaults={"username": first_name, "is_verified": True}
        )
        if created:
            user.set_unusable_password()
            user.save()
            CandidateProfile.objects.create(user=user, first_name=first_name, last_name=last_name)

        tokens = create_tokens_for_user(user)
        response = Response(
            {
                "detail": "Login successful",
                "user": {"id": str(user.id), "email": user.email, "role": user.role}
            },
            status=status.HTTP_200_OK
        )
        response = set_tokens_in_response(response, tokens)
        return response
    
from .services.mfa_service import verify_otp

class LoginView(views.APIView):
    permission_classes = [AllowAny]
    serializer_class = SeekerLoginSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        

        if user.role == "HR" and not user.is_hr:
            return Response(
                {"error": "Please contact admin"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.mfa_enabled:
            otp = request.data.get("otp")

            if not otp:
                return Response(
                    {
                        "mfa_required": True,
                        "email": user.email
                    },
                    status=status.HTTP_200_OK
                )
            verify = verify_otp(user,otp)
            if not verify:
                return Response(
                    {"error": "Invalid OTP"},
                    status=status.HTTP_400_BAD_REQUEST
                )


        login(request, user)

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

        response = set_tokens_in_response(response, tokens)
        return response
    

class SetupMFAView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, version):

        user = request.user
        if user.mfa_enabled:
            return Response({"message": "MFA already enabled", 'mfa_enabled': user.mfa_enabled}, status=status.HTTP_200_OK)
        secret = generate_mfa_secret(user)
        otp_uri = get_provisioning_uri(user)
        return Response({"secret": user.mfa_secret, "otp_uri": otp_uri, 'mfa_enabled': user.mfa_enabled}, status=status.HTTP_200_OK)

    def post(self, request, version):
        user = request.user
        otp = request.data.get("otp")
        if enable_mfa(user, otp):
            return Response({"message": "MFA successfully enabled"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)


class DisableMFAView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, version):
        user = request.user
        otp = request.data.get("otp")
        if disable_mfa(user, otp):
            return Response({"message": "MFA disabled successfully"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid OTP or MFA not enabled"}, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request, version):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"error": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            tokens = refresh_tokens(refresh_token)
            response = Response({"message": "Access token refreshed"}, status=status.HTTP_200_OK)
            response = set_tokens_in_response(response, tokens)
            return response
        except TokenError:
            response = Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie("refresh_token")
            return response


class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, version):
        refresh_token = request.COOKIES.get("refresh_token")
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass
        response.delete_cookie("refresh_token")
        return response


class ForgotPasswordView(views.APIView):
    def post(self, request, version):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "If email exists, reset link sent."})
        send_password_reset_email(user)
        return Response({"message": "Reset link sent to email."})


class ResetPasswordView(views.APIView):
    def post(self, request, version):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")
        if not uid or not token or not password:
            return Response({"error": "Invalid data"}, status=400)
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except:
            return Response({"error": "Invalid link"}, status=400)
        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({"error": "Token invalid or expired"}, status=400)
        user.set_password(password)
        user.save()
        return Response({"message": "Password reset successful"})