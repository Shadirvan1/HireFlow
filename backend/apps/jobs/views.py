from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import JobSerializer,UpdateApplicationStatusSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import Job
from apps.accounts.models import HRProfile
from django.conf import settings
import os
from datetime import timedelta
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.utils import timezone
FASTAPI_URL=os.getenv("FASTAPI_URL")
# Create your views here.

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10  # You can change this to 5, 20, etc.
    page_size_query_param = 'page_size'
    max_page_size = 100

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

class GetSavedJobsView(APIView):
    # Use the default pagination or a custom one
    pagination_class = PageNumberPagination

    def get(self, request, version):
        # 1. Get the SavedJob instances
        saved_instances = SavedJob.objects.filter(
            user=request.user
        ).select_related('job', 'job__company').order_by('-created_at') # Order by most recently saved
        
        # 2. Extract Job QuerySet (Stay in QuerySet land for pagination to work)
        # We use .values_list or just filter Job directly for better performance:
        job_ids = saved_instances.values_list('job_id', flat=True)
        jobs = Job.objects.filter(id__in=job_ids).select_related('company')

        # 3. Initialize Paginator
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(jobs, request)
        
        if page is not None:
            serializer = JobSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        # Fallback if pagination is disabled
        serializer = JobSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

        
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import Job
from .serializers import JobSerializer


class GetAllJobsView(APIView):
    pagination_class = PageNumberPagination

    def get(self, request, version):
        # Base Query
        jobs = Job.objects.filter(is_approve=True, is_active=True).select_related('company')

        # --- 1. SEARCH LOGIC ---
        search_query = request.query_params.get('search')
        if search_query:
            jobs = jobs.filter(
                Q(title__icontains=search_query) | 
                Q(description__icontains=search_query) |
                Q(company__name__icontains=search_query)
            )

        # --- 2. LOCATION LOGIC ---
        location_query = request.query_params.get('location')
        if location_query:
            jobs = jobs.filter(location__icontains=location_query)

        # --- 3. DATE POSTED FILTER (Freshness) ---
        date_posted = request.query_params.get('date_posted')
        if date_posted and date_posted != 'all':
            today = timezone.now().date()
            if date_posted == 'today':
                jobs = jobs.filter(created_at__date=today)
            elif date_posted == 'week':
                jobs = jobs.filter(created_at__gte=timezone.now() - timedelta(days=7))
            elif date_posted == 'month':
                jobs = jobs.filter(created_at__gte=timezone.now() - timedelta(days=30))

        # --- 4. NEW: SORTING LOGIC ---
        # Default to newest (-created_at) if not specified
        sort_by = request.query_params.get('ordering', '-created_at')
        if sort_by in ['created_at', '-created_at']:
            jobs = jobs.order_by(sort_by)
        else:
            jobs = jobs.order_by('-created_at')

        # --- 5. PAGINATION ---
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(jobs, request)
        
        if page is not None:
            serializer = JobSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        serializer = JobSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)



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
            print("==== DEBUG START ====")
            print("URL:", fastapi_url)
            print("Payload:", {"job_ids": job_ids, "company_id": company_id})
            print("Headers:", auth_headers)
            print("==== CALLING FASTAPI ====")
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
                    print(app)
                    if not app: continue
                    print(app)
                    print("status ====== ",app.status)
                    
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
from .models import SavedJob
class ToggleSaveJobView(APIView):
    def post(self, request, version, pk):
        job = Job.objects.get(id=pk) 
        saved_job, created = SavedJob.objects.get_or_create(user=request.user, job=job)
        
        if not created:
            saved_job.delete()
            return Response({"message": "Job removed from saved list", "saved": False})
        
        return Response({"message": "Job saved successfully", "saved": True})

from rest_framework import generics, permissions
from .models import JobApplication
from .serializers import JobApplicationReadSerializer


class MyApplicationsListView(generics.ListAPIView):
    serializer_class = JobApplicationReadSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination  # <--- Added Pagination

    def get_queryset(self):
        """
        Return applications for the current logged-in candidate.
        """
        user = self.request.user
        
        try:
            # We filter by candidate_profile and optimize with select_related
            return JobApplication.objects.filter(
                applicant=user.candidate_profile
            ).select_related(
                'job', 
                'job__company'
            ).order_by('-applied_at')
        except AttributeError:
            # Returns an empty queryset if the user has no candidate_profile
            return JobApplication.objects.none()