from django.urls import path
from . import views

urlpatterns = [
    path("register/",views.SeekerRegisterView.as_view()),
    path("token/refresh/",views.RefreshTokenView.as_view()),
    path("resend/link/",views.ResendEmailLinkView.as_view()),
    path("auth/google/",views.GoogleAuthenticationView.as_view()),
    path("login/",views.LoginView.as_view()),
    path("verify-email/<uidb64>/<token>/",views.VerifyEmailView.as_view()),
    path("hr/register/",views.HRRegisterView.as_view()),
    path("hr/setup-mfa/",views.SetupMFAView.as_view()),
    path("hr/disable-mfa/",views.DisableMFAView.as_view()),
    path("candidate/profile/",views.CandidateProfileView.as_view()),
    path("logout/",views.LogoutView.as_view()),
    path("forgot-password/", views.ForgotPasswordView.as_view()),
    path("reset-password/", views.ResetPasswordView.as_view()),
    path("me/", views.Me.as_view()),
    path("hr/invite/", views.InviteUserView.as_view()),
    path("invite/<str:role>/", views.InviteUserView.as_view()),
    path("hr/register/<token>/", views.RegisterViaInviteView.as_view()),
    path("phone/verify-otp/", views.FirebaseVerifyView.as_view()),
    
    
]
