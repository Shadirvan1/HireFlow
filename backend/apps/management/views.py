from django.shortcuts import render
from rest_framework import views,status
from rest_framework.response import Response
from apps.accounts.serializers import HRProfileSerializer
from apps.accounts.models import HRProfile
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from apps.jobs.models import Job, JobApplication
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from apps.jobs.models import Job, JobApplication, SavedJob
from django.utils import timezone
from apps.accounts.models import CandidateProfile, HRProfile


User = get_user_model()

class AllCompanyEmployeesView(views.APIView):
    permission_classes=[IsAuthenticated]
   
    def get(self, request, version):
        try:
            hr_profile = HRProfile.objects.get(user=request.user)
        except HRProfile.DoesNotExist:
            return Response({"error": "HR profile not found"}, status=status.HTTP_404_NOT_FOUND)

        employees = HRProfile.objects.filter(company=hr_profile.company).exclude(user=request.user)

        serializer = HRProfileSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ToggleEmployeesView(views.APIView):
    permission_classes=[IsAuthenticated]
    def patch(self,request,version,id=None):
        try:
            toggeld_user = HRProfile.objects.get(id=id)
        except HRProfile.DoesNotExist:
            return Response({"error":"Hr or Interviewer does not exist"},status=status.HTTP_400_BAD_REQUEST)
        try:
            hr_profile = HRProfile.objects.get(user=request.user)
        except HRProfile.DoesNotExist:
            return Response({"error": "HR profile not found"}, status=status.HTTP_404_NOT_FOUND)
        if toggeld_user.company == hr_profile.company: 
            hr_profile.is_active = not hr_profile.is_active
            hr_profile.save()
        else:
            return Response({"error":"This hr not belongs to your firm"},status=status.HTTP_400_BAD_REQUEST)
        return Response({"success":"successfully Toggled"},status=status.HTTP_200_OK)
    
from .serializers import UpdateApplicationStatusSerializer
class ToggleEmployeeRoleView(views.APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, version, id=None):
        if not id:
            return Response({"error": "Employee ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            toggled_user = HRProfile.objects.get(id=id)
        except HRProfile.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateApplicationStatusSerializer(
            data=request.data, 
            context={'request': request, 'toggled_user': toggled_user}
        )

        if serializer.is_valid():
            serializer.update(toggled_user, serializer.validated_data)
            return Response({
                "success": "Role updated successfully",
                "role": toggled_user.role
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from apps.accounts.models import CandidateProfile
from apps.accounts.serializers import CandidateProfileSerializer
class GetCandidateView(views.APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request,version):
        try:
            candidate = CandidateProfile.objects.get(user=request.user)
        except CandidateProfile.DoesNotExist:
            return Response({"error":"User is guest"},status=status.HTTP_400_BAD_REQUEST)
        serializer = CandidateProfileSerializer(candidate)
        return Response(serializer.data,status=status.HTTP_200_OK)


from .models import Notification


from .models import Notification
from .serializers import NotificationSerializer,NotificationCreateSerializer
class CreateNotificationAPIView(views.APIView):
    permission_classes=[IsAuthenticated]

    """
    GET: List all notifications for the current user
    """
    def get(self, request, version):
        notifications = Notification.objects.filter(
            user_id=request.user.id
        ).order_by('-created_at')

        serializer = NotificationCreateSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def post(self, request, version):

        serializer = NotificationCreateSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"status": "Notification created successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.shortcuts import get_object_or_404

class NotificationDetailAPIView(views.APIView):
    permission_classes=[IsAuthenticated]

    def patch(self, request, version, pk):
        notification = get_object_or_404(
            Notification,
            pk=pk,
            user=request.user
        )

        notification.is_read = True
        notification.save()

        return Response(
            {"status": "updated"},
            status=status.HTTP_200_OK
        )

    def delete(self, request, version, pk):
        notification = get_object_or_404(
            Notification,
            pk=pk,
            user=request.user
        )

        notification.delete()
        return Response(
            {"status": "deleted"},
            status=status.HTTP_204_NO_CONTENT
        )




class CandidateDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, version):
        user = request.user
       
        profile = getattr(user, 'candidate_profile', None)
        
        if not profile:
            return Response({"error": "Candidate profile not found"}, status=404)

        applications = JobApplication.objects.filter(applicant=profile)
        
        stats = {
            "total_applications": applications.count(),
            "interviews_scheduled": applications.filter(status="SCHEDULED").count(),
            "offers_received": applications.filter(status="HIRED").count(),
            "saved_jobs_count": SavedJob.objects.filter(user=user).count(),
        }

        
        recent_applications = applications.select_related('job', 'job__company').order_by('-applied_at')[:5]
        app_list = [{
            "job_title": app.job.title,
            "company": app.job.company.name,
            "status": app.status,
            "applied_at": app.applied_at,
            "meeting_link": app.meeting_link if app.status == "SCHEDULED" else None
        } for app in recent_applications]

        return Response({
            "metrics": stats,
            "recent_applications": app_list
        })
class HRDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, version):
        user = request.user
        hr_profile = getattr(user, 'hr_profile', None)
        
        if not hr_profile or not hr_profile.company:
            return Response({"error": "HR profile or Company not linked"}, status=404)

        company = hr_profile.company
        jobs = Job.objects.filter(company=company)
        
        stats = {
            "active_jobs": jobs.filter(is_active=True).count(),
            "total_applicants": JobApplication.objects.filter(job__company=company).count(),
            "pending_reviews": JobApplication.objects.filter(job__company=company, status="APPLIED").count(),
            "hires_to_date": hr_profile.hires_count
        }

        hot_jobs = jobs.annotate(app_count=Count('applications')).order_by('-app_count')[:3]
        hot_jobs_list = [{
            "title": j.title,
            "count": j.app_count,
            "is_active": j.is_active
        } for j in hot_jobs]

        return Response({
            "metrics": stats,
            "top_performing_jobs": hot_jobs_list,
            "company_name": company.name
        })


class InterviewerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, version):
        user = request.user
        
        
        upcoming_interviews = JobApplication.objects.filter(
            interviewer=user,
            status="SCHEDULED",
            scheduled_at__gte=timezone.now()
        ).select_related('job', 'applicant__user').order_by('scheduled_at')

        stats = {
            "upcoming_interviews_count": upcoming_interviews.count(),
            "completed_this_month": JobApplication.objects.filter(
                interviewer=user, 
                applied_at__month=timezone.now().month
            ).exclude(status="SCHEDULED").count()
        }

        schedule = [{
            "candidate_name": f"{intv.applicant.first_name} {intv.applicant.last_name}",
            "job_title": intv.job.title,
            "time": intv.scheduled_at,
            "link": intv.meeting_link
        } for intv in upcoming_interviews]

        return Response({
            "metrics": stats,
            "schedule": schedule
        })