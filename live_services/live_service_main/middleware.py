import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import BaseAuthentication

class IDOnlyUser:
    """Minimal user object with ID only."""
    def __init__(self, user_id):
        self.id = user_id
        self.is_authenticated = True
        self.is_anonymous = False
        
    def __str__(self):
        return f"User(id={self.id})"


class JWTAuthMiddleware:
    """
    Middleware to extract user ID from JWT stored in cookies.
    No database queries.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):

        # 1️⃣ Extract headers
        headers = dict(scope.get("headers", []))
        raw_cookies = headers.get(b"cookie", b"")

        token = None

        if raw_cookies:
            # 2️⃣ Decode cookie string
            cookie_string = raw_cookies.decode()
            cookies = cookie_string.split(";")

            for cookie in cookies:
                cookie = cookie.strip()
                if cookie.startswith("access_token="):
                    token = cookie.split("=", 1)[1]
                    break

        # 3️⃣ Validate JWT
        if token:
            try:
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )

                user_id = payload.get("user_id")

                if user_id:
                    scope["user"] = IDOnlyUser(user_id)
                else:
                    scope["user"] = AnonymousUser()

            except (jwt.ExpiredSignatureError, jwt.DecodeError, Exception):
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)
    
class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT authentication for HTTP requests.
    Reads access_token from cookies.
    No database queries.
    """

    def authenticate(self, request):

        token = request.COOKIES.get("access_token")

        if not token:
            return None

        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"]
            )

            user_id = payload.get("user_id")

            if not user_id:
                raise AuthenticationFailed("Invalid token")

            return (IDOnlyUser(user_id), None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token expired")

        except jwt.DecodeError:
            raise AuthenticationFailed("Invalid token")

        except Exception:
            raise AuthenticationFailed("Authentication failed")