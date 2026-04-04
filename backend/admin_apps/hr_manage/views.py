from django.contrib.auth import get_user_model
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .utilities import send_hr_approval_email

# Create your views here.
User = get_user_model()

import secrets

from apps.accounts.models import HRProfile, User
from apps.accounts.serializers import HRProfileSerializer


class HRDeatilsApiView(APIView):
    serializer_class = HRProfileSerializer

    def get(self, request, version):
        hr_details = HRProfile.objects.select_related("user", "company").filter(
            user__is_verified=True, user__is_hr=False
        )
        serializer = self.serializer_class(hr_details, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class HRApproveAPIVIEW(APIView):
    def post(self, request, version, id):
        try:
            hr = HRProfile.objects.get(id=id)
        except HRProfile.DoesNotExist:
            return Response({"error": "This user not exist"})
        user = hr.user
        user.is_hr = True
        user.save()
        send_hr_approval_email(user)
        return Response({"message": "APPROVED"}, status=status.HTTP_200_OK)


class HRRejectAPIView(APIView):
    def post(self, request, version, id):
        try:
            hr = HRProfile.objects.get(id=id)
        except HRProfile.DoesNotExist:
            return Response({"error": "This user not exist"})
        user = hr.user
        user.is_hr = False
        user.save()
        send_hr_approval_email(user)
        return Response({"message": "REJECTED"}, status=status.HTTP_200_OK)
