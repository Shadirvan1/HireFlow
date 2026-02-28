from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # This matches ws://your-domain.com/ws/chat/<room_name>/
    # Example: ws://127.0.0.1:8001/ws/chat/global/
    path("ws/chat/<str:room_name>/", consumers.PrivateChatConsumer.as_asgi()),
    
]