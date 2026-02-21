from django.shortcuts import render
from rest_framework.views import APIView 
from rest_framework import status 
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .utilities import send_hr_approval_email
# Create your views here.
User = get_user_model()

from apps.accounts.models import HRProfile
from apps.accounts.serializers import HRProfileSerializer
import secrets
class HRDeatilsApiView(APIView):
    serializer_class = HRProfileSerializer
    def get(self,request,version):
        hr_details=HRProfile.objects.all()
        serializer = self.serializer_class(hr_details,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    

class HRApproveAPIVIEW(APIView):
    def post(self,request,version,id):
        try:
            hr = HRProfile.objects.get(id=id)
        except HRProfile.DoesNotExist:
            return Response({"error":"This user not exist"})
        approval_code = secrets.randbelow(900000) + 100000
        user = hr.user
        user.hr_password = approval_code
        user.save()
        send_hr_approval_email(user)
        return Response({"message":"APPROVED"},status=status.HTTP_200_OK)



