import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
import apps.live_chat.routing
from apps.live_chat.middlewares import JWTAuthMiddleware

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

application = ProtocolTypeRouter(
    {
        # Standard HTTP requests
        "http": get_asgi_application(),
        # WebSocket requests
        "websocket": JWTAuthMiddleware(
            URLRouter(apps.live_chat.routing.websocket_urlpatterns)
        ),
    }
)
