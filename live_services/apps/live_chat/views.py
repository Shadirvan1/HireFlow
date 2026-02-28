from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Message
from .serializer import MessageSerializer


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, other_user_id):
        user = request.user
        

        
        current_user_id = request.user.id

        if not current_user_id:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        messages = Message.objects.filter(
            (Q(sender_id=current_user_id) & Q(receiver_id=other_user_id)) |
            (Q(sender_id=other_user_id) & Q(receiver_id=current_user_id))
        ).order_by("timestamp")

        serializer = MessageSerializer(messages, many=True)
        print(serializer.data)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
from django.core.cache import cache

class OnlineStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_ids = request.query_params.get("ids")

        if not user_ids:
            return Response({})

        ids_list = user_ids.split(",")

        status = {}
        for uid in ids_list:
            status[uid] = bool(cache.get(f"user_online_{uid}"))

        return Response(status)