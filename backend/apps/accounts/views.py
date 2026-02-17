from django.shortcuts import render
from rest_framework import views,status
from .serializers import SeekerSerializer,Hrserializer
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CandidateProfile
import os
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
                    "username": email,
                    "role":"CANDIDATE"
                }
            )
            
            CandidateProfile.objects.create(user=user,first_name=first_name,last_name=last_name)


            refresh = RefreshToken.for_user(user)

            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            })
        except ValueError:
            return Response({"error": "Token verification failed"}, status=status.HTTP_400_BAD_REQUEST)
        

