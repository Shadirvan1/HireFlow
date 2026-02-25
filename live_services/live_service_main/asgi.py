import os
import django
from django.core.asgi import get_asgi_application

# 1. Set the settings module first
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'live_service_main.settings')

# 2. Initialize Django (This MUST happen before importing your middleware)
django.setup()

# 3. NOW you can safely import your apps and middleware
from channels.routing import ProtocolTypeRouter, URLRouter
from .middleware import JWTAuthMiddleware
import apps.live_chat.routing 

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            apps.live_chat.routing.websocket_urlpatterns
        )
    ),
})