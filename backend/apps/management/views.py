from django.shortcuts import render
from rest_framework import views,status
from rest_framework.response import Response
from apps.accounts.serializers import HRProfileSerializer
from apps.accounts.models import HRProfile
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from jobs.models import Job, JobApplication
# Create your views here.
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

        # 1. Fetch the target HRProfile
        try:
            toggled_user = HRProfile.objects.get(id=id)
        except HRProfile.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        # 2. Initialize Serializer with context
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


from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class HRDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Ensure the user is actually HR and has a company
        try:
            hr_profile = user.hr_profile
            company = hr_profile.company
        except HRProfile.DoesNotExist:
            return Response({"error": "User is not an HR member"}, status=403)

        # 1. Job Stats
        total_jobs = Job.objects.filter(company=company).count()
        active_jobs = Job.objects.filter(company=company, is_active=True).count()

        # 2. Application Stats
        # We look for applications linked to jobs belonging to this HR's company
        apps_query = JobApplication.objects.filter(job__company=company)
        
        total_applications = apps_query.count()
        status_breakdown = apps_query.values('status').annotate(count=Count('status'))

        # 3. Recent Applications
        recent_apps = apps_query.select_related('applicant', 'job').order_by('-applied_at')[:5]
        recent_data = [
            {
                "candidate": f"{app.applicant.first_name} {app.applicant.last_name}",
                "job_title": app.job.title,
                "status": app.status,
                "applied_at": app.applied_at
            } for app in recent_apps
        ]

        return Response({
            "company_name": company.name,
            "stats": {
                "total_jobs": total_jobs,
                "active_jobs": active_jobs,
                "total_applications": total_applications,
                "pipeline": {item['status']: item['count'] for item in status_breakdown}
            },
            "recent_applications": recent_data
        })