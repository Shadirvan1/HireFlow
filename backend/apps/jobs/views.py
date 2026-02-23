from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import JobSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import Job
from apps.accounts.models import HRProfile
# Create your views here.

class CreateJobView(APIView):
    serializer_class = JobSerializer
    def post(self,request,version):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        hr_profile = HRProfile.objects.get(user=request.user)
        serializer.save(company=hr_profile.company)
        return Response({"message":"Job application created successfully"},status=status.HTTP_201_CREATED)
    
class CompanyJobsView(APIView):
    def get(self,request,version):
        hr_profile = HRProfile.objects.get(user=request.user)
        jobs = Job.objects.filter(company = hr_profile.company)
        serializer = JobSerializer(jobs , many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
class CompanyActivityView(APIView):
    def patch(self,request,version,id=None):
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"error":"Job does not exist"},status=status.HTTP_400_BAD_REQUEST)
        job.is_active = not job.is_active
        job.save()
        return Response({"message":"Cancelled job post"},status=status.HTTP_200_OK)
    def delete(self,request,version,id=None):
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"error":"Job does not exist"},status=status.HTTP_400_BAD_REQUEST)
        job.delete()
        return Response({"message":"Delete job"},status=status.HTTP_200_OK)


        

            

