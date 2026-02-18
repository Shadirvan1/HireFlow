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
from django.contrib.auth.hashers import check_password
# Create your views here.
User = get_user_model()

class seeker_register(views.APIView):
    permission_classes=[]
    serializer_class = SeekerSerializer
    def post(self,request,version):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Registration successful. Please login.",
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "role": user.role,
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

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
                        "role": user.role,
                    }
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    def post(self,request,version):
        phone_email = request.data.get("phone_email")
        password = request.data.get("password")
        if not phone_email or not password:
            return Response(
                {"error": "Phone/Email and password required"},
                status=status.HTTP_400_BAD_REQUEST,
            )        
        try:
            if "@" in phone_email:
                user = User.objects.get(email=phone_email)
            else:
                user = User.objects.get(phone=phone_email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email/phone"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not user.check_password(password):
            return Response(
                {"error": "Invalid password or email / phone"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.is_verified:
            return Response({"error":"Please verify first"},status=status.HTTP_404_NOT_FOUND)
        
        if user.is_active:
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
                status=status.HTTP_200_OK,
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
        return Response({"error":"User is inactive please contact to admin"})

