from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import requests

from .serializers import AIChatSerializer
from apps.accounts.models import Company

# Import our refined DynamoDB services
from dynamodb.services.ai_chat_history import save_chat_history, get_chat_history

FASTAPI_URL = os.getenv("FASTAPI_URL")
class AIChatView(APIView):
    
    def get(self, request, version):
        """
        Fetch chat history from DynamoDB. 
        Supports pagination via query parameter: ?last_timestamp=...
        """
        user_id = str(request.user.id)
        # Get last_timestamp from the frontend request (if it exists)
        last_timestamp = request.query_params.get('last_timestamp')
        
        # Call the updated service function
        history_data = get_chat_history(
            user_id=user_id, 
            limit=15, 
            last_timestamp=last_timestamp
        )
        
        # history_data['messages'] is already formatted as [{"role": "...", "content": "..."}]
        # but since it's DESC (newest first), we reverse it for the UI to show chronological order
        messages = history_data.get("messages", [])
        messages.reverse() 

        return Response({
            "history": messages,
            # Pass this back so React knows what the next "top" timestamp is
            "last_evaluated_key": history_data.get("last_evaluated_key")
        }, status=status.HTTP_200_OK)

    def post(self, request, version):
        # ... (Your post logic is perfect as is) ...
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
            response = requests.post(f"{FASTAPI_URL}/chat", json=payload, timeout=30)
            if response.status_code != 200:
                return Response({"error": "AI service error"}, status=status.HTTP_502_BAD_GATEWAY)

            ai_content = response.json()

            # Store in DynamoDB
            save_chat_history(
                user_id=str(user.id),
                message=serializer.validated_data["message"],
                response=ai_content,
                company_id=company_id
            )

            return Response({"response": ai_content}, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)