from django.shortcuts import render
from rest_framework import views,status
from rest_framework.response import Response
from apps.accounts.serializers import HRProfileSerializer
from apps.accounts.models import HRProfile
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
# Create your views here.
User = get_user_model()

class AllCompanyEmployeesView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, version):
        try:
            hr_profile = HRProfile.objects.get(user=request.user)
        except HRProfile.DoesNotExist:
            return Response({"error": "HR profile not found"}, status=status.HTTP_404_NOT_FOUND)

        employees = HRProfile.objects.filter(company=hr_profile.company)

        serializer = HRProfileSerializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ToggleEmployeesView(views.APIView):
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
class ToggleEmployeeRoleView(views.APIView):

    ALLOWED_ROLES = ["HR", "INTERVIEWER"]

    def patch(self, request, version, id=None):
        role = request.data.get("role")
        
        if not role or role.upper() not in self.ALLOWED_ROLES:
            return Response(
                {"error": f"Invalid role. Allowed roles: {', '.join(self.ALLOWED_ROLES)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        role = role.upper()

        if not id:
            return Response({"error": "Employee ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            toggled_user = HRProfile.objects.get(id=id)
        except HRProfile.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        if not hasattr(request.user, "hr_profile"):
            return Response({"error": "You are not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
        hr_profile = request.user.hr_profile

        if toggled_user.company != hr_profile.company:
            return Response({"error": "This employee does not belong to your company"}, status=status.HTTP_400_BAD_REQUEST)

        if toggled_user.id == hr_profile.id:
            return Response({"error": "You cannot change your own role"}, status=status.HTTP_400_BAD_REQUEST)
        if toggled_user.role == role.upper():
            return Response({"error": "Employee already has this role"}, status=status.HTTP_400_BAD_REQUEST)

        toggled_user.role = role.upper()
        toggled_user.save()

        return Response({"success": "Role updated successfully","role":role.upper()}, status=status.HTTP_200_OK)