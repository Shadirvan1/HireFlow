import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.cache import cache
from .models import Message


class PrivateChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        self.other_user_id = (
            self.scope["url_route"]["kwargs"].get("userId")
            or self.scope["url_route"]["kwargs"].get("room_name")
            )

        ids = sorted([int(self.user.id), int(self.other_user_id)])
        self.room_group_name = f"private_{ids[0]}_{ids[1]}"

        
        await database_sync_to_async(cache.set)(
            f"user_online_{self.user.id}", True, timeout=None
        )

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

        
        await database_sync_to_async(cache.delete)(
            f"user_online_{self.user.id}"
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get("message")

        if not message_text:
            return

        # Save message first
        message = await self.save_message(
            self.user.id,
            self.other_user_id,
            message_text
        )

        # Send to group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": message.id,
                "message": message.message,
                "sender_id": message.sender_id,
                "timestamp": str(message.timestamp),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message_text):
        return Message.objects.create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message_text
        )