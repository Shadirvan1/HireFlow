from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # This matches ws://your-domain.com/ws/chat/<room_name>/
    # Example: ws://127.0.0.1:8001/ws/chat/global/
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
    
]