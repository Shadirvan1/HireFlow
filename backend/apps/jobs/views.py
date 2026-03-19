import os
import requests
from datetime import timedelta
from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import get_user_model

User = get_user_model()
from apps.accounts.models import HRProfile, CandidateProfile, Company
from .models import Job, JobApplication, SavedJob
from .serializers import (
    JobSerializer, 
    UpdateApplicationStatusSerializer, 
    JobApplySerializer, 
    JobApplicationSerializer, 
    AllJobsRankSerializer, 
    JobApplicationReadSerializer
)

FASTAPI_URL = "http://ai_service:8002/api/ai" 

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class CreateJobView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobSerializer

    def post(self, request, version):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        hr_profile = HRProfile.objects.get(user=request.user)
        serializer.save(company=hr_profile.company, user=request.user)
        return Response({"message": "Job application created successfully"}, status=status.HTTP_201_CREATED)

class CompanyJobsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, version):
        hr_profile = HRProfile.objects.get(user=request.user)
        jobs = Job.objects.filter(company=hr_profile.company)
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CompanyActivityView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, version, id=None):
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"error": "Job does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        job.is_active = not job.is_active
        job.save()
        return Response({"message": "Cancelled job post"}, status=status.HTTP_200_OK)

    def delete(self, request, version, id=None):
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"error": "Job does not exist"}, status=status.HTTP_400_BAD_REQUEST)
        
        job.delete()
        return Response({"message": "Delete job"}, status=status.HTTP_200_OK)

class GetSavedJobsView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get(self, request, version):
        saved_instances = SavedJob.objects.filter(user=request.user).values_list('job_id', flat=True)
        jobs = Job.objects.filter(id__in=saved_instances).select_related('company').order_by('-id')

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(jobs, request)
        if page is not None:
            serializer = JobSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        serializer = JobSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class GetAllJobsView(APIView):
    pagination_class = PageNumberPagination

    def get(self, request, version):
        jobs = Job.objects.filter(is_approve=True, is_active=True).select_related('company')
        search_query = request.query_params.get('search')
        if search_query:
            jobs = jobs.filter(
                Q(title__icontains=search_query) | 
                Q(description__icontains=search_query) |
                Q(company__name__icontains=search_query)
            )

        location_query = request.query_params.get('location')
        if location_query:
            jobs = jobs.filter(location__icontains=location_query)

        date_posted = request.query_params.get('date_posted')
        if date_posted and date_posted != 'all':
            today = timezone.now().date()
            if date_posted == 'today':
                jobs = jobs.filter(created_at__date=today)
            elif date_posted == 'week':
                jobs = jobs.filter(created_at__gte=timezone.now() - timedelta(days=7))
            elif date_posted == 'month':
                jobs = jobs.filter(created_at__gte=timezone.now() - timedelta(days=30))

        sort_by = request.query_params.get('ordering', '-created_at')
        if sort_by in ['created_at', '-created_at']:
            jobs = jobs.order_by(sort_by)
        else:
            jobs = jobs.order_by('-created_at')

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(jobs, request)
        if page is not None:
            serializer = JobSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)

        serializer = JobSerializer(jobs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class GetJobByIdview(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, version, id=None):
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response({"error": "Job not available"}, status=status.HTTP_404_NOT_FOUND)

        try:
            candidate_profile = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response({"error": "Candidate profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = JobApplySerializer({'job': job, 'candidate': candidate_profile})
        return Response(serializer.data, status=status.HTTP_200_OK)

class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, version, id=None):
        serializer = JobApplicationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                candidate = request.user.candidate_profile
                serializer.save(applicant=candidate)
                return Response({"message": "Application submitted successfully!"}, status=status.HTTP_201_CREATED)
            except AttributeError:
                return Response({"error": "User does not have a Candidate Profile."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetALLJobsRank(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, version):
        user = request.user
        try:
            company = user.hr_profile.company
            company_id = str(company.id)
        except AttributeError:
            return Response({"error": "HR Profile or Company not found"}, status=status.HTTP_404_NOT_FOUND)

        jobs = Job.objects.filter(company=company, is_active=True, is_approve=True, embedd_id__isnull=False)
        job_map = {job.embedd_id: job for job in jobs}
        job_ids = list(job_map.keys())

        if not job_ids:
            return Response({"jobs": [], "message": "No valid jobs found"}, status=status.HTTP_200_OK)

        try:
            auth_headers = {
                "X-API-KEY": settings.SECRET_KEY,
                "Content-Type": "application/json"
            }

            response = requests.post(
                f"{FASTAPI_URL}/rank-batch", 
                json={"job_ids": job_ids, "company_id": company_id}, 
                headers=auth_headers, 
                timeout=10
            )
            
            if response.status_code != 200:
                return Response({"error": "AI ranking service error"}, status=status.HTTP_502_BAD_GATEWAY)

            ranked_data = response.json()
            application_ids = []
            for job_res in ranked_data.get("results", []):
                for cand in job_res.get("results", []):
                    application_ids.append(int(cand["application_id"]))

            applications = JobApplication.objects.prefetch_related("applicant__user").filter(id__in=application_ids)
            app_map = {app.id: app for app in applications}

            formatted_jobs_list = []
            for job_result in ranked_data.get("results", []):
                job = job_map.get(job_result.get("job_id"))
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
    permission_classes = []  # Open for Webhooks, protected by Secret Key

    def post(self, request, version):
        # 1. Security Check (Callback Key)
        callback_key = request.headers.get('X-CALLBACK-KEY')
        if callback_key != settings.SECRET_KEY:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        # 2. Validation
        serializer = UpdateApplicationStatusSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            application_id = data["application_id"]
            incoming_status = data["status"]
            
            try:
                application = JobApplication.objects.get(id=application_id)
                
                
                if incoming_status == "INTERVIEW_SCHEDULED":
                    application.status = "SCHEDULED"
                  
                    application.meeting_link = data.get("meeting_link")
                    application.scheduled_at = data.get("scheduled_at")
                else:
                    application.status = "APPLIED"

                application.save()
                
                return Response({
                    "message": "Application status and interview details updated",
                    "id": application.id,
                    "status": application.status
                }, status=status.HTTP_200_OK)

            except JobApplication.DoesNotExist:
                return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ToggleSaveJobView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, version, pk):
        job = Job.objects.get(id=pk) 
        saved_job, created = SavedJob.objects.get_or_create(user=request.user, job=job)
        if not created:
            saved_job.delete()
            return Response({"message": "Job removed from saved list", "saved": False})
        return Response({"message": "Job saved successfully", "saved": True})

class MyApplicationsListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get(self, request, version):
        try:
            queryset = JobApplication.objects.filter(
                applicant=request.user.candidate_profile
            ).select_related('job', 'job__company').order_by('-applied_at')
        except AttributeError:
            queryset = JobApplication.objects.none()

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = JobApplicationReadSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = JobApplicationReadSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


from rest_framework import generics, permissions
from .models import JobApplication
from .serializers import ScheduledInterviewSerializer

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import JobApplication
from .serializers import ScheduledInterviewSerializer
class ScheduledInterviewsAPIView(APIView):
    """
    Returns a list of scheduled interviews.
    HR sees all, Interviewers see only their own assignments.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_role = getattr(user, 'role', None)

        # 1. Filter Logic
        if user_role == 'HR':
            queryset = JobApplication.objects.filter(
                status='SCHEDULED'
            ).order_by('scheduled_at')
            
        elif user_role == 'INTERVIEWER':
            queryset = JobApplication.objects.filter(
                status='SCHEDULED', 
                interviewer=user
            ).order_by('scheduled_at')
            
        else:
            # If a Candidate or unauthorized role hits this
            return Response(
                {"detail": "Access denied. Role not recognized."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Serialization
        serializer = ScheduledInterviewSerializer(queryset, many=True)
        
        
        return Response({
            "count": queryset.count(),
            "role_context": user_role,
            "results": serializer.data
        }, status=status.HTTP_200_OK)
class InterviewersListView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, version):
            try:
                # 1. Get the company of the logged-in HR/User
                # We look at the HRProfile of the person making the request
                current_user_profile = request.user.hr_profile
                user_company = current_user_profile.company

                if not user_company:
                    return Response({"error": "User is not associated with a company"}, status=400)

                # 2. Fetch all HRProfiles in the SAME company
                # We can filter for specific roles if needed (e.g., HR and INTERVIEWER)
                company_members = HRProfile.objects.filter(
                    company=user_company,
                    is_active=True
                ).select_related('user')

                # 3. Format the data for the frontend
                interviewers_list = []
                for profile in company_members:
                    interviewers_list.append({
                        "id": profile.user.id,
                        "full_name": profile.user.username,
                        "email": profile.user.email,
                        "designation": profile.designation,
                        "role": profile.role
                    })

                return Response(interviewers_list)

            except HRProfile.DoesNotExist:
                return Response({"error": "HR Profile not found"}, status=404)


class AssignInterviewerView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request,version, pk):
        try:
            application = JobApplication.objects.get(pk=pk)
            interviewer_id = request.data.get("interviewer_id")
            
            if interviewer_id:
                user = User.objects.get(id=interviewer_id)
                application.interviewer = user
            else:
                application.interviewer = None
                
            application.save()
            return Response({"message": "Interviewer assigned successfully"}, status=200)
        except (JobApplication.DoesNotExist, User.DoesNotExist):
            return Response({"error": "Resource not found"}, status=404)
        
from .serializers import FullCandidateDetailSerializer, ApplicationStatusUpdateSerializer
from django.shortcuts import get_object_or_404
class CandidateApplicationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, version, pk):
        """
        Fetch all data for a single candidate application.
        """
        # Ensure the HR can only see applications for jobs they/their company posted
        application = get_object_or_404(JobApplication, id=pk)
        
        # Optional: Add security check
        # if application.job.company.hr_members.filter(user=request.user).exists():
        
        serializer = FullCandidateDetailSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, version, pk):
        """
        Update the status, meeting link, or schedule of the application.
        """
        application = get_object_or_404(JobApplication, id=pk)
        
        # Use partial=True to allow updating only the status without sending other fields
        serializer = ApplicationStatusUpdateSerializer(application, data=request.data, partial=True)
        
        if serializer.is_valid():
            updated_app = serializer.save()
            
            # Return the full updated data for frontend UI consistency
            return Response({
                "message": "Status updated successfully",
                "current_status": updated_app.status,
                "data": FullCandidateDetailSerializer(updated_app).data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)