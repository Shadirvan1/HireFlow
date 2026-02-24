from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

def create_tokens_for_user(user):
    """
    Create access and refresh tokens for a given user.
    Returns a dictionary with access and refresh tokens.
    """
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }

def refresh_tokens(refresh_token_str):
    serializer = TokenRefreshSerializer(
        data={"refresh": refresh_token_str}
    )
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data
def set_tokens_in_response(response, tokens):
    """
    Set access and refresh tokens in HttpOnly cookies.
    """
    response.set_cookie(
        key="access_token",
        value=tokens["access"],
        httponly=True,
        secure=False, 
        samesite="Lax"
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh"],
        httponly=True,
        secure=False, 
        samesite="Lax"
    )
    return response

def blacklist_refresh_token(refresh_token_str):
    """
    Blacklist a refresh token (used during logout).
    """
    try:
        token = RefreshToken(refresh_token_str)
        token.blacklist()
        return True
    except TokenError:
        return False