import jwt
from django.conf import settings
from channels.db import database_sync_to_async
# REMOVE: from django.contrib.auth.models import AnonymousUser  <-- DELETE THIS

@database_sync_to_async
def get_user(user_id):
    from django.contrib.auth import get_user_model
    from django.contrib.auth.models import AnonymousUser

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        return user
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser

        headers = dict(scope.get("headers", []))
        cookie_header = headers.get(b"cookie", b"").decode()
        
        cookies = {
            c.split('=')[0].strip(): c.split('=')[1].strip() 
            for c in cookie_header.split(';') if '=' in c
        }

        token = cookies.get("access_token")

        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get("user_id")
                if user_id:
                    scope["user"] = await get_user(user_id)
                else:
                    scope["user"] = AnonymousUser()
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)