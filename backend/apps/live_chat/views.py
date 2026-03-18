from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import requests
from django.conf import settings

from .serializers import AIChatSerializer
from apps.accounts.models import Company
from rest_framework.permissions import IsAuthenticated

from dynamodb.services.ai_chat_history import save_chat_history, get_chat_history
from hireflow_main.decorators import role_required

FASTAPI_URL = os.getenv("FASTAPI_URL")
class AIChatView(APIView):
    
    def get(self, request, version):
        """
        Fetch chat history from DynamoDB. 
        """
        user_id = str(request.user.id)
        last_timestamp = request.query_params.get('last_timestamp')
        
        history_data = get_chat_history(
            user_id=user_id, 
            limit=15, 
            last_timestamp=last_timestamp
        )
        
        messages = history_data.get("messages", [])
        messages.reverse() 

        return Response({
            "history": messages,
            "last_evaluated_key": history_data.get("last_evaluated_key")
        }, status=status.HTTP_200_OK)

    def post(self, request, version):
        serializer = AIChatSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        company_id = None
        if hasattr(user, 'hr_profile') and user.hr_profile.company:
            company_id = str(user.hr_profile.company.id)

        payload = {
            "message": serializer.validated_data["message"],
            "company_id": company_id,
            "user_id": str(user.id)
        }

        try:
            # --- ADDED AUTH HEADERS HERE ---
            auth_headers = {
                "X-API-KEY": settings.SECRET_KEY,
                "Content-Type": "application/json"
            }

            response = requests.post(
                f"{FASTAPI_URL}/chat", 
                json=payload, 
                headers=auth_headers, # <--- INJECTED
                timeout=30
            )

            if response.status_code != 200:
                # If FastAPI returns 401/403, this will catch it
                return Response({"error": "AI service unauthorized or error"}, status=status.HTTP_502_BAD_GATEWAY)

            ai_content = response.json()

            save_chat_history(
                user_id=str(user.id),
                message=serializer.validated_data["message"],
                response=ai_content,
                company_id=company_id
            )

            return Response({"response": ai_content}, status=status.HTTP_200_OK)
            
        except requests.exceptions.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

from dynamodb.services.live_chat_history import get_chat_history

class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, version, pk=None):
        ids = sorted([int(request.user.id), int(pk)])
        room_name = f"private_{ids[0]}_{ids[1]}"
        
        # Fetch from DynamoDB
        messages = get_chat_history(room_name)
        return Response(messages, status=200)