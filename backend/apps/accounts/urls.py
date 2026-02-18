from django.urls import path
from . import views

urlpatterns = [
    path("register/",views.seeker_register.as_view()),
    path("auth/google/",views.Google_authentication.as_view()),
    path("login/",views.seeker_login.as_view()),
    


]
