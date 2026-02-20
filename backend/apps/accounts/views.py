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
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import check_password
# Create your views here.
from .utilities import send_verification_email


User = get_user_model()

class seeker_register(views.APIView):
    permission_classes=[]
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

class hr_register(views.APIView):
    permission_classes=[]
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
    def post(self,request,version):
        google_id = os.getenv("GOOGLE_CLIENT_ID")
        token = request.data.get("token")
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
                    "role":"CANDIDATE",
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
            print("error")
            return Response({"error": "Token verification failed"}, status=status.HTTP_400_BAD_REQUEST)
class seeker_login(views.APIView):
    serializer_class = SeekerLoginSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = serializer.validated_data["user"]

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


       