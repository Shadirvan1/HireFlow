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

class GetAllJobsView(APIView):
    def get(self,request,version):
        jobs = Job.objects.filter(is_approve = True,is_active = True)
        
        serializer = JobSerializer(jobs,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

from apps.accounts.models import Company
from .serializers import JobApplySerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.models import CandidateProfile
from rest_framework.permissions import IsAuthenticated

class GetJobByIdview(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request, version, id=None):
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"error": "Job not available"}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        try:
            candidate_profile = CandidateProfile.objects.get(user=user)
        except CandidateProfile.DoesNotExist:
            return Response({"error":"user is not logged in"},status=status.HTTP_404_NOT_FOUND)

        context_data = {
            'job': job,
            'candidate': candidate_profile
        }

        serializer = JobApplySerializer(context_data)
        return Response(serializer.data, status=status.HTTP_200_OK)

from .serializers import JobApplicationSerializer
class ApplyJobView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self, request, version, id=None):
        serializer = JobApplicationSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                candidate = request.user.candidate_profile
                
                serializer.save(applicant=candidate)
                return Response({
                    "message": "Application submitted successfully!",
                }, status=status.HTTP_201_CREATED)
            except AttributeError:
                return Response({
                    "error": "User does not have a Candidate Profile."
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
import requests
import os 
FASTAPI_URL=os.getenv("FASTAPI_URL")
import requests





class GetALLJobsRank(APIView):
    def get(self, request, version):
        user = request.user 
        
        try:
            company = user.hr_profile.company
            company_id = str(company.id) # Capture the company ID
        except AttributeError:
            return Response({"error": "HR Profile or Company not found"}, status=status.HTTP_404_NOT_FOUND)

        jobs = Job.objects.filter(
            company=company, 
            is_active=True, 
            is_approve=True, 
            embedd_id__isnull=False
        )
        
        job_ids = [job.embedd_id for job in jobs]
        
        if not job_ids:
            return Response({"jobs": [], "message": "No valid jobs found"}, status=status.HTTP_200_OK)

        try:
            fastapi_url = f"{FASTAPI_URL}/rank-batch"
            # Send both job_ids AND company_id for security
            payload = {
                "job_ids": job_ids,
                "company_id": company_id 
            }

            response = requests.post(fastapi_url, json=payload, timeout=10)
            print(response)
            
            if response.status_code == 200:
                return Response({"jobs": response.json()}, status=status.HTTP_200_OK)
            return Response({"error": "Ranking error"}, status=response.status_code)
                
        except requests.exceptions.RequestException:
            return Response({"error": "Ranking server unreachable"}, status=503)