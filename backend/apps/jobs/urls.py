from django.urls import path
from . import views
urlpatterns = [
    path("hr/get/companyjobs/",views.CompanyJobsView.as_view()),
    path("hr/companyjobs/<int:id>/",views.CompanyActivityView.as_view()),
    path("hr/create/job/",views.CreateJobView.as_view()),
    path("get/all/jobs/",views.GetAllJobsView.as_view()),
    path("get/job/<int:id>/",views.GetJobByIdview.as_view()),
    path("job/apply/<int:id>/",views.ApplyJobView.as_view()),
    path("job/ranking/<int:id>/",views.GetALLJobsRank.as_view()),
    path("job/rankings/",views.GetALLJobsRank.as_view()), 
    path("application/update-status/",views.ApplicationStatusView.as_view()), 
    path("job/save/<int:pk>/",views.ToggleSaveJobView.as_view()), 
    path('get/saved/', views.GetSavedJobsView.as_view(), name='saved-jobs'),
    path('my-applications/', views.MyApplicationsListView.as_view(), name='my-applications-list'),
    path('scheduled-interviews/', views.ScheduledInterviewsAPIView.as_view(), name='scheduled-interviews'),
    path('interviewers/list/', views.InterviewersListView.as_view(), name='interviewers-list'),
    path('assign/interviewer/<int:pk>/', views.AssignInterviewerView.as_view(), name='assign-interviewer'),
    path('hr/candidate/application/<int:pk>/', views.CandidateApplicationDetailView.as_view(), name='candidate-app-detail'),
]