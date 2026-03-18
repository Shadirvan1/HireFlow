from django.urls import path
from . import views
urlpatterns = [
    path('chat/',views.AIChatView.as_view(),name='ai-chat'),
    path('history/<int:pk>/',views.ChatHistoryView.as_view(),name='ai-chat'),
]