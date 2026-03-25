from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import requests
from django.conf import settings

from .serializers import AIChatSerializer
from apps.accounts.models import Company
from rest_framework.permissions import IsAuthenticated

from dynamodb.services.ai_chat_history import save_ai_chat_history, get_ai_chat_history

FASTAPI_URL = "http://ai_service:8002/api/ai" 



class AIChatView(APIView):
    
    def get(self, request, version):
        print("Fetching chat history for user:", request.user.id)
        user_id = str(request.user.id)
        last_timestamp = request.query_params.get('last_timestamp')
        print(last_timestamp)
        try:
            print(last_timestamp)
           
            history_data = get_ai_chat_history(
                room_name=user_id, 
                limit=15, 
                last_timestamp=last_timestamp
            )
            
            messages = history_data.get("messages", [])
            messages.reverse() 

            return Response({
                "history": messages,
                "last_evaluated_key": history_data.get("last_evaluated_key")
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error fetching chat history for user {user_id}: {str(e)}")
            return Response({"error": "Failed to load chat history"}, status=500)

    def post(self, request, version):
        serializer = AIChatSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        try:
            
            payload = {
                "message": serializer.validated_data["message"],
                "user_id": str(user.id)
            }

            
            response = requests.post(
                f"{FASTAPI_URL}/chat", 
                json=payload, 
                headers={"X-API-KEY": settings.SECRET_KEY},
                timeout=30
            )
            

            if response.status_code != 200:
                return Response({"error": "AI Service Error"}, status=502)

            ai_content = response.json()

           
            save_ai_chat_history(
                user_id=str(user.id),
                message=serializer.validated_data["message"],
                response=ai_content
            )

            return Response({"response": ai_content}, status=200)

        except Exception as e:
            print(f"Error in AIChatView for user {user.id}: {str(e)}")
            return Response({"error": "Internal Server Error"}, status=500)
        
from dynamodb.services.live_chat_history import get_chat_history

class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, version, pk=None):
        ids = sorted([int(request.user.id), int(pk)])
        room_name = f"private_{ids[0]}_{ids[1]}"
        
       
        messages = get_chat_history(room_name)
        return Response(messages, status=200)