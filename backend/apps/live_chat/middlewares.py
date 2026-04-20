from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.conf import settings
import jwt

@database_sync_to_async
def get_user(user_id):
    from django.contrib.auth import get_user_model  
    from django.contrib.auth.models import AnonymousUser

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        print(f"[DEBUG] Found User: {user} (ID: {user_id})")
        return user
    except User.DoesNotExist:
        print(f"[DEBUG] User with ID {user_id} not found in database.")
        return AnonymousUser()


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser  

        # 1. Capture the query string
        query_string = scope["query_string"].decode()
        query_params = parse_qs(query_string)
        
        print(f"\n--- JWT Auth Middleware Debug ---")
        print(f"[DEBUG] Query Params: {query_params}")

        token = query_params.get("token")

        if token:
            raw_token = token[0]
            print(f"[DEBUG] Token found: {raw_token[:15]}... (length: {len(raw_token)})")
            
            try:
                # 2. Attempt to decode
                payload = jwt.decode(
                    raw_token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )
                print(f"[DEBUG] Decoded Payload: {payload}")
                
                # 3. Get user from DB
                user_id = payload.get("user_id")
                if user_id:
                    scope["user"] = await get_user(user_id)
                else:
                    print("[DEBUG] 'user_id' key missing from JWT payload.")
                    scope["user"] = AnonymousUser()

            except jwt.ExpiredSignatureError:
                print("[DEBUG] JWT Error: Token has expired.")
                scope["user"] = AnonymousUser()

            except jwt.InvalidTokenError as e:
                print(f"[DEBUG] JWT Error: Invalid token ({str(e)})")
                scope["user"] = AnonymousUser()
            
            except Exception as e:
                print(f"[DEBUG] Unexpected Error during Auth: {str(e)}")
                scope["user"] = AnonymousUser()

        else:
            print("[DEBUG] No token provided in URL query string.")
            scope["user"] = AnonymousUser()

        print(f"[DEBUG] Final Scope User: {scope['user']}")
        print(f"----------------------------------\n")

        return await self.app(scope, receive, send)