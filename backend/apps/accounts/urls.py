from django.urls import path
from . import views

urlpatterns = [
    path("register/",views.seeker_register.as_view()),
    path("resend/link/",views.resend_email_link.as_view()),
    path("auth/google/",views.Google_authentication.as_view()),
    path("login/",views.seeker_login.as_view()),
    path("verify-email/<uidb64>/<token>/",views.VerifyEmail.as_view()),
    path("hr/profile/",views.Hr_Profile.as_view()),
    path("hr/company/",views.CompanyApiVIew.as_view()),
    
]
