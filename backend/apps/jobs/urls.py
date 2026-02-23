from django.urls import path
from . import views
urlpatterns = [
    path("hr/get/companyjobs/",views.CompanyJobsView.as_view()),
    path("hr/companyjobs/<int:id>/",views.CompanyActivityView.as_view()),
    path("hr/create/job/",views.CreateJobView.as_view()),
]
