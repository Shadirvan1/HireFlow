from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import JobSerializer,UpdateApplicationStatusSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import Job
from apps.accounts.models import HRProfile
from django.conf import settings
# Create your views here.

class CreateJobView(APIView):
    serializer_class = JobSerializer
    def post(self,request,version):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        hr_profile = HRProfile.objects.get(user=request.user)
        serializer.save(company=hr_profile.company,user=request.user)
        
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
        print(serializer.errors)
        print("Validation failed for job application:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
import requests
import os 
FASTAPI_URL=os.getenv("FASTAPI_URL")
import requests
from .models import JobApplication

from .serializers import AllJobsRankSerializer 
class GetALLJobsRank(APIView):
    print("Initializing GetALLJobsRank APIView...")
    def get(self, request, version):
        print("starting to fetch ranked jobs for company dashboard...")
        user = request.user
        try:
            company = user.hr_profile.company
            company_id = str(company.id)
        except AttributeError:
            return Response({"error": "HR Profile or Company not found"}, status=status.HTTP_404_NOT_FOUND)
        print(f"Fetching jobs for company: {company.name} (ID: {company_id})")
        jobs = Job.objects.filter(
            company=company, is_active=True, is_approve=True, embedd_id__isnull=False
        )
        print(jobs)
        print(f"Found {jobs.count()} jobs for company: {company.name}")
        job_map = {job.embedd_id: job for job in jobs}
        job_ids = list(job_map.keys())

        if not job_ids:
            return Response({"jobs": [], "message": "No valid jobs found"}, status=status.HTTP_200_OK)

        try:
            print("try works")
            # --- ADDED AUTH HEADERS HERE ---
            auth_headers = {
                "X-API-KEY": settings.SECRET_KEY,
                "Content-Type": "application/json"
            }
            print("Sending request to AI service...")
            # 1. Fetch from AI Service
            fastapi_url = f"{FASTAPI_URL}/rank-batch"
            print(job_ids, company_id  )
            response = requests.post(
                fastapi_url, 
                json={"job_ids": job_ids, "company_id": company_id}, 
                headers=auth_headers, 
                timeout=10
            )
            
            print("AI service response received")
            
            if response.status_code != 200:
                return Response({"error": "AI ranking service error"}, status=status.HTTP_502_BAD_GATEWAY)

            ranked_data = response.json()

            # 2. Batch fetch Database relations
            application_ids = []
            for job_res in ranked_data.get("results", []):
                for cand in job_res.get("results", []):
                    application_ids.append(int(cand["application_id"]))
                    

            applications = JobApplication.objects.prefetch_related("applicant__user").filter(id__in=application_ids)
            print(applications)
            
            app_map = {app.id: app for app in applications}
            print(app_map)

            # 3. Structure data for Serializer
            formatted_jobs_list = []
            for job_result in ranked_data.get("results", []):
                job_id = job_result.get("job_id")
                job = job_map.get(job_id)
                if not job: continue

                candidates_list = []
                for cand in job_result.get("results", []):
                    app = app_map.get(int(cand["application_id"]))
                    if not app: continue
                    
                    candidates_list.append({
                        "application_id": app.id,
                        "applicant_id": app.applicant.id,
                        "applicant_name": app.applicant.user.username,
                        "email": app.applicant.user.email,
                        "status": app.status,
                        "vector_score": cand.get("vector_score"),
                        "llm_score": cand.get("llm_score")
                    })
                print("Candidates List for Job ID", job_id, ":", candidates_list)

                formatted_jobs_list.append({
                    "job_id": job.id,
                    "job_title": job.title,
                    "total_candidates": len(candidates_list),
                    "candidates": candidates_list
                })

            final_data = {
                "success": True,
                "total_jobs": len(formatted_jobs_list),
                "jobs": formatted_jobs_list
            }
            serializer = AllJobsRankSerializer(final_data)
            
            return Response(serializer.data, status=status.HTTP_200_OK)

        except requests.exceptions.Timeout:
            return Response({"error": "AI service timeout"}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class ApplicationStatusView(APIView):
    permission_classes = []

    def post(self, request, version):
        print("Application status callback received from n8n")
        
        # 1. Security Check
        callback_key = request.headers.get('X-CALLBACK-KEY')
        if callback_key != settings.SECRET_KEY:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        # 2. Validation
        serializer = UpdateApplicationStatusSerializer(data=request.data)
        if serializer.is_valid():
            application_id = serializer.validated_data["application_id"]
            incoming_status = serializer.validated_data["status"]
            
            try:
                application = JobApplication.objects.get(id=application_id)

                # 3. Status Mapping
                # If n8n sends "INTERVIEW_SCHEDULED", we save it as "SCHEDULED"
                if incoming_status == "INTERVIEW_SCHEDULED":
                    application.status = "SCHEDULED"
                else:
                    application.status = "APPLIED"

                application.save()

                return Response(
                    {
                        "message": "Application status updated to SCHEDULED",
                    },
                    status=status.HTTP_200_OK
                )

            except JobApplication.DoesNotExist:
                return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)