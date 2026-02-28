from django.urls import path
from . import views

urlpatterns = [
    # Make sure this matches exactly what the frontend is calling
    path('api/chat/history/<int:other_user_id>/', views.ChatHistoryView.as_view(), name='chat_history'),
    path("api/chat/online-status/", views.OnlineStatusView.as_view()),
]