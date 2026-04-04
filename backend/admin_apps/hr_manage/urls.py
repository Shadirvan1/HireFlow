from django.urls import include, path

from . import views

urlpatterns = [
    path("hr/details/", views.HRDeatilsApiView.as_view()),
    path("hr/<int:id>/approve/", views.HRApproveAPIVIEW.as_view()),
    path("hr/<int:id>/reject/", views.HRRejectAPIView.as_view()),
]
