import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from urllib.parse import parse_qs

User = get_user_model()

class JWTAuthMiddleware:
    """
    Custom middleware to authenticate WebSocket connections via JWT.
    Supports token passing via Query String (?token=...) or 
    the Sec-WebSocket-Protocol header.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # 1. Extract token from Query String
        query_dict = parse_qs(scope["query_string"].decode())
        token = query_dict.get("token", [None])[0]

        # 2. Fallback: Extract from Headers (if query string is empty)
        if not token:
            headers = dict(scope.get("headers", []))
            # Check for Sec-WebSocket-Protocol or Authorization header
            auth_header = headers.get(b"authorization", b"").decode()
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        # 3. Authenticate User
        scope["user"] = await self.get_user(token) if token else AnonymousUser()
        
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        try:
            # Validate and decode
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=["HS256"]
            )
            
            # Use 'user_id' from payload to fetch user
            user_id = payload.get("user_id")
            if not user_id:
                return AnonymousUser()
                
            return User.objects.get(id=user_id)
            
        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            return AnonymousUser()
        except Exception:
            # Logging here is recommended for production monitoring
            return AnonymousUser()