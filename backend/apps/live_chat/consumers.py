import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from dynamodb.services.live_chat_history import save_message_to_dynamo
from asgiref.sync import sync_to_async
from django.core.cache import cache

class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        self.other_user_id = str(self.scope["url_route"]["kwargs"]["userId"])
        
        try:
            # Sort IDs to create a unique room name for this pair
            ids = sorted([int(self.user.id), int(self.other_user_id)])
            self.room_name = f"private_{ids[0]}_{ids[1]}"
        except (ValueError, TypeError):
            await self.close()
            return

        # 1. Set online status in Cache (1 hour timeout)
        cache.set(f"user_online_{self.user.id}", True, timeout=3600)

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        # 2. Check if the OTHER user is currently online and tell the connector
        other_online = cache.get(f"user_online_{self.other_user_id}", False)
        await self.send(text_data=json.dumps({
            "type": "presence",
            "user_id": str(self.other_user_id),
            "status": "online" if other_online else "offline"
        }))

        # 3. Notify the other person in the room that I am now online
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "presence_message",
                "user_id": str(self.user.id),
                "status": "online"
            }
        )

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            cache.delete(f"user_online_{self.user.id}")

        if hasattr(self, 'room_name'):
            await self.channel_layer.group_send(
                self.room_name,
                {
                    "type": "presence_message",
                    "user_id": str(self.user.id),
                    "status": "offline"
                }
            )
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get("message")
        if not message_text: return

        message_id = str(uuid.uuid4())

        # Save to DynamoDB
        item = await sync_to_async(save_message_to_dynamo, thread_sensitive=False)(
            self.room_name,
            str(self.user.id),
            self.other_user_id,
            message_text,
            message_id
        )

        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "chat_message",
                "message_data": item
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat",
            **event["message_data"]
        }))

    async def presence_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "presence",
            "user_id": event["user_id"],
            "status": event["status"]
        }))