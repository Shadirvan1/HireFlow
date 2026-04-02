from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.UserListCreateView.as_view(), name='admin-user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='admin-user-detail'),
    path('companies/', views.CompanyListCreateView.as_view(), name='admin-company-list'),
    path('hr-profiles/', views.HRProfileListView.as_view(), name='admin-hr-list'),
    path('hr-profiles/<int:pk>/', views.HRProfileDetailView.as_view(), name='admin-hr-detail'),
    path('candidate-profiles/', views.CandidateProfileListView.as_view(), name='admin-candidate-list'),
    path('candidate-profiles/<int:pk>/', views.CandidateProfileDetailView.as_view(), name='admin-candidate-detail'),
]