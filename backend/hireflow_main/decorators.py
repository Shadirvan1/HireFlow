from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def role_required(allowed_roles=[]):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(instance, request, *args, **kwargs):
            # 1. Check if user is authenticated
            if not request.user or not request.user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # 2. Check if user's role is in the allowed list
            user_role = getattr(request.user, 'role', None)
            
            if user_role in allowed_roles:
                return view_func(instance, request, *args, **kwargs)
            
            # 3. Fail if role doesn't match
            return Response(
                {"error": f"Access denied. Required roles: {allowed_roles}"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return _wrapped_view
    return decorator