from django.urls import path
from . import views

urlpatterns = [
    path('admin/users/', views.UserListCreateView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', views.UserDetailView.as_view(), name='admin-user-detail'),
    path('admin/companies/', views.CompanyListCreateView.as_view(), name='admin-company-list'),
    path('admin/hr-profiles/', views.HRProfileListView.as_view(), name='admin-hr-list'),
    path('admin/hr-profiles/<int:pk>/', views.HRProfileDetailView.as_view(), name='admin-hr-detail'),
    path('admin/candidate-profiles/', views.CandidateProfileListView.as_view(), name='admin-candidate-list'),
    path('admin/candidate-profiles/<int:pk>/', views.CandidateProfileDetailView.as_view(), name='admin-candidate-detail'),
]