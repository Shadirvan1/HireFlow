from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.shortcuts import render
from rest_framework import views,status
from .serializers import SeekerSerializer,Hrserializer,SeekerLoginSerializer
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CandidateProfile
import os
from django.contrib.auth import login
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import check_password
from .utilities import send_verification_email
from rest_framework.permissions import AllowAny


User = get_user_model()

class seeker_register(views.APIView):
    permission_classes=[AllowAny]
    serializer_class = SeekerSerializer
    def post(self,request,version):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if not user.is_verified:
                send_verification_email(user)
                return Response(
                    {
                        "message": "Activation link sent successfull.",
                        "user": {
                            "id": str(user.id),
                            "email": user.email,
                           
                        }
                    },
                    status=status.HTTP_201_CREATED
                )
            return Response(
                    {
                        "message": "Activation link sent successfull.",
                        "user": {
                            "id": str(user.id),
                            "email": user.email,
                        
                        }
                    },
                    status=status.HTTP_201_CREATED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class resend_email_link(views.APIView):
    permission_classes=[AllowAny]

    def post(self,request,version):
        email =  request.data.get("email")
        if not email:
            return Response({"error":"Please give email"},status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error":"Email is invalid"},status=status.HTTP_400_BAD_REQUEST)
        if user.is_verified:
            return Response({"error":"Email is already verified"},status=status.HTTP_400_BAD_REQUEST)
        send_verification_email(user)
        return Response({"message":"Verification link sented successfully"},status=status.HTTP_200_OK)
from .serializers import CandidateProfileSerializer
from rest_framework.permissions import IsAuthenticated
class CandidateProfileView(views.APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CandidateProfileSerializer

    def get(self, request, version):
        profile = request.user.candidate_profile
        serializer = self.serializer_class(profile)
        return Response(serializer.data)

    def put(self, request, version):
        profile = request.user.candidate_profile

        serializer = self.serializer_class(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profile updated successfully",
                "data": serializer.data
            })

        return Response(serializer.errors, status=400)



class hr_register(views.APIView):
    permission_classes=[AllowAny]

    serializer_class = Hrserializer
    def post(self,request,version):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            
            user = serializer.save(commit=False)
            user.role = "CANDIDATE"
            user.save()
            return Response(
                {
                    "message": "Registration successful. Please login.",
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmail(views.APIView):
    permission_classes=[AllowAny]

    def get(self, request,version, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_verified = True
                user.save()

                return Response({"message": "Email verified successfully!"})
            if user.is_verified:
                return Response({"message":"Already verified"},status=status.HTTP_200_OK)
            return Response({"error": "Invalid or expired token."},status=status.HTTP_400_BAD_REQUEST)

        except Exception:
            return Response({"error": "Invalid link"},status=status.HTTP_400_BAD_REQUEST)



class Google_authentication(views.APIView):
    permission_classes=[AllowAny]
    def post(self,request,version):
        google_id = os.getenv("GOOGLE_CLIENT_ID")
        token = request.data.get("token") or request.data.get("credential")
        if not token :
            return Response({"error": "No token provided"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            idinfo = id_token.verify_oauth2_token(
                token,google_requests.Request(),google_id
            )
            email = idinfo.get("email")
            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")
            if not email:
                return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": first_name,
                    "is_verified" : True
                }
            )
            if created:
                user.set_unusable_password()
                user.save()
                CandidateProfile.objects.create(user=user,first_name=first_name,last_name=last_name)

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            response = Response(
                {"detail": "Login successful",
                 "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "role": user.role,
                    }
                 },
                status=status.HTTP_200_OK
            )

            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=False,
                samesite="Lax"
            )
            response.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite="Lax"
            )

            return response
        except ValueError:
            
            return Response({"error": "Token verification failed"}, status=status.HTTP_400_BAD_REQUEST)
class seeker_login(views.APIView):
    permission_classes=[AllowAny]

    serializer_class = SeekerLoginSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.validated_data["user"]
        if user.role == "HR":
            return Response({"error":"Email is not registered"},status=status.HTTP_400_BAD_REQUEST)
        login(request,user)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response(
            {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                },
            },
            status=200,
        )

        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        return response
    

"""
hr section
"""
from .serializers import HRProfileSerializer
from .models import HRProfile

class Hr_Profile(views.APIView):
    permission_classes=[AllowAny]

    serializer_class = HRProfileSerializer

    def post(self, request, version):
        try:
            user = User.objects.get(email=request.data['email'])
        except User.DoesNotExist:
            return Response({"error": "Email not exist please register first"}, status=status.HTTP_400_BAD_REQUEST)
        if not user.is_verified:
            return Response({"error": "Please verify first"}, status=status.HTTP_400_BAD_REQUEST)
        obj = HRProfile.objects.filter(user=user.id).exists()
        if obj:
            return Response({"message":"Profile already created you can continue "},status=status.HTTP_200_OK)

        data = request.data.copy()
        data['user_id'] = user.id

        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile created successfully"}, status=status.HTTP_200_OK)
        print("error found")
        return Response({"error": serializer.errors,"messages":"error found in serializer"}, status=status.HTTP_400_BAD_REQUEST)
    
from .serializers import CompanySerializer

class CompanyApiVIew(views.APIView):
    permission_classes=[AllowAny]

    serializer_class = CompanySerializer
    def post(self,request,version):
        try:
            hr_user = User.objects.get(email=request.data["email"])
        except User.DoesNotExist:
            return Response({"error": "Email not exist please register first"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            hr_profile = HRProfile.objects.get(user=hr_user)
        except HRProfile.DoesNotExist:
            return Response({"error": "Please first make profile"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            company = serializer.save()
            hr_profile.company = company
            hr_profile.save()
            return Response({"message":"Your password sented to email within 12 hours"},status=status.HTTP_200_OK)
        return Response({"error":serializer.errors},status=status.HTTP_400_BAD_REQUEST)
    

from .serializers import HRLoginSerializer


from rest_framework import views, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import HRLoginSerializer




class HRLoginApiView(views.APIView):
    permission_classes=[AllowAny]

    serializer_class = HRLoginSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        otp = request.data.get("otp")

        if user.mfa_enabled:

            if not otp:
                return Response(
                    {
                        "mfa_required": True,
                        "email": user.email,
                    },
                    status=status.HTTP_200_OK
                )

      
            totp = pyotp.TOTP(user.mfa_secret)

            if not totp.verify(otp):
                return Response(
                    {"error": "Invalid OTP"},
                    status=status.HTTP_400_BAD_REQUEST
                )

     

        user.role = "HR"
        user.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response(
            {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": "HR",
                },
            },
            status=status.HTTP_200_OK
        )

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        return response

from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


import pyotp


class SetupMFAView(views.APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request,version):

        user = request.user

        if user.mfa_enabled:
            return Response({"message": "MFA already enabled",'mfa_enabled':user.mfa_enabled},status=status.HTTP_200_OK)

   
        if not user.mfa_secret:
            user.generate_mfa_secret()

       
        otp_uri = pyotp.totp.TOTP(user.mfa_secret).provisioning_uri(
            name=user.email,
            issuer_name="HireFlow"
        )

        return Response({
            "secret": user.mfa_secret,
            "otp_uri": otp_uri,
            'mfa_enabled':user.mfa_enabled
        },status=status.HTTP_200_OK)

    def post(self, request,version):
       
        user = request.user
        otp = request.data.get("otp")

        if not user.mfa_secret:
            return Response({"error": "MFA secret not found"}, status=400)

        totp = pyotp.TOTP(user.mfa_secret)
        if not totp.verify(otp):
            return Response({"error": "Invalid OTP"}, status=400)

      
        user.mfa_enabled = True
        user.save()

        return Response({"message": "MFA successfully enabled"})




from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings


class RefreshTokenView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request, version):

        refresh_token = request.COOKIES.get("refresh_token")
        print(refresh_token)
        print(request.COOKIES)

        if not refresh_token:
            return Response(
                {"error": "Refresh token missing"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            refresh = RefreshToken(refresh_token)

          
            new_refresh = RefreshToken.for_user(refresh.user)
            new_access = str(new_refresh.access_token)

            response = Response(
                {"message": "Access token refreshed"},
                status=status.HTTP_200_OK
            )

   
            response.set_cookie(
                key="access_token",
                value=new_access,
                httponly=True,
                secure=False, 
                samesite="Lax",
              
            )

            response.set_cookie(
                key="refresh_token",
                value=str(new_refresh),
                httponly=True,
                secure=False,  
                samesite="Lax",

            )

            return response

        except TokenError:
            response = Response(
                {"error": "Invalid or expired refresh token"},
                status=status.HTTP_401_UNAUTHORIZED
            )

            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")

            return response

class DisableMFAView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, version):

        user = request.user
        otp = request.data.get("otp")

        if not user.mfa_enabled:
            return Response(
                {"error": "MFA is not enabled"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not otp:
            return Response(
                {"error": "OTP is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        totp = pyotp.TOTP(user.mfa_secret)

        if not totp.verify(otp):
            return Response(
                {"error": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.mfa_enabled = False
        user.mfa_secret = None
        user.save()

        return Response(
            {"message": "MFA disabled successfully"},
            status=status.HTTP_200_OK
        )
class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, version):

        refresh_token = request.COOKIES.get("refresh_token")

        response = Response(
            {"message": "Logged out successfully"},
            status=status.HTTP_200_OK
        )

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .utilities import send_password_reset_email

class ForgotPasswordView(views.APIView):
    def post(self, request,version):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "If email exists, reset link sent."})



        send_password_reset_email(
            user
        )

        return Response({"message": "Reset link sent to email."})
    
class ResetPasswordView(views.APIView):
    def post(self, request,version):
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