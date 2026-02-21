from django.urls import path
from . import views

urlpatterns = [
    path("register/",views.seeker_register.as_view()),
    path("token/refresh/",views.RefreshTokenView.as_view()),
    path("resend/link/",views.resend_email_link.as_view()),
    path("auth/google/",views.Google_authentication.as_view()),
    path("login/",views.seeker_login.as_view()),
    path("verify-email/<uidb64>/<token>/",views.VerifyEmail.as_view()),
    path("hr/profile/",views.Hr_Profile.as_view()),
    path("hr/company/",views.CompanyApiVIew.as_view()),
    path("hr/login/",views.HRLoginApiView.as_view()),
    path("hr/setup-mfa/",views.SetupMFAView.as_view()),
    path("hr/disable-mfa/",views.DisableMFAView.as_view()),
    path("candidate/profile/",views.CandidateProfileView.as_view()),
    path("logout/",views.LogoutView.as_view()),
    path("forgot-password/", views.ForgotPasswordView.as_view()),
    path("reset-password/", views.ResetPasswordView.as_view()),

    
]
