from django.urls import path
from . import views
urlpatterns = [
    path("hr/get/companyjobs/",views.CompanyJobsView.as_view()),
    path("hr/companyjobs/<int:id>/",views.CompanyActivityView.as_view()),
    path("hr/create/job/",views.CreateJobView.as_view()),
    path("get/all/jobs/",views.GetAllJobsView.as_view()),
    path("get/job/<int:id>/",views.GetJobByIdview.as_view()),
    path("job/apply/<int:id>/",views.ApplyJobView.as_view()),
]
