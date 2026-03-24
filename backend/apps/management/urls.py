from django.urls import path
from . import views
urlpatterns = [
    path("get/all/employees/",views.AllCompanyEmployeesView.as_view()),
    path("user/<int:id>/toggle-activity/",views.ToggleEmployeesView.as_view()),
    path("user/<int:id>/change/role/",views.ToggleEmployeeRoleView.as_view()),
    path("candidate/profile/",views.GetCandidateView.as_view()),
    path("add/notifications/", views.CreateNotificationAPIView.as_view()),
    path("notifications/<int:pk>/", views.NotificationDetailAPIView.as_view()),
    path("hr-dashboard/", views.HRDashboardView.as_view()),
    path("candidate-dashboard/", views.CandidateDashboardView.as_view()),
    path("interviewer-dashboard/", views.InterviewerDashboardView.as_view()),
    
]
