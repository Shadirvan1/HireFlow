import jwt
from django.conf import settings
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

@database_sync_to_async
def get_user(user_id):
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        print(f"[DEBUG] Found User: {user} (ID: {user_id})")
        return user
    except User.DoesNotExist:
        print(f"[DEBUG] User with ID {user_id} not found.")
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # 1. Get all headers from the scope
        # Headers are a list of tuples: [(b'host', b'localhost'), (b'cookie', b'access_token=...')]
        headers = dict(scope.get("headers", []))
        
        # 2. Extract and decode the 'cookie' header
        cookie_header = headers.get(b"cookie", b"").decode()
        
        # 3. Parse the cookie string into a dictionary
        # Example: "access_token=abc; csrftoken=123" -> {'access_token': 'abc', 'csrftoken': '123'}
        cookies = {
            c.split('=')[0].strip(): c.split('=')[1].strip() 
            for c in cookie_header.split(';') if '=' in c
        }

        token = cookies.get("access_token")

        print(f"\n--- JWT Cookie Auth Debug ---")
        if token:
            print(f"[DEBUG] Token found in cookies: {token[:15]}...")
            try:
                # 4. Decode the JWT
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )
                user_id = payload.get("user_id")
                
                if user_id:
                    scope["user"] = await get_user(user_id)
                else:
                    print("[DEBUG] No 'user_id' in payload.")
                    scope["user"] = AnonymousUser()

            except jwt.ExpiredSignatureError:
                print("[DEBUG] JWT Error: Token expired.")
                scope["user"] = AnonymousUser()
            except jwt.InvalidTokenError:
                print("[DEBUG] JWT Error: Invalid token.")
                scope["user"] = AnonymousUser()
        else:
            print("[DEBUG] No 'access_token' cookie found in headers.")
            scope["user"] = AnonymousUser()

        print(f"[DEBUG] Final Scope User: {scope['user']}")
        print(f"------------------------------\n")

        return await self.app(scope, receive, send)