from channels.generic.websocket import AsyncWebsocketConsumer
from dynamodb.services.live_chat_history import save_message_to_dynamo
from asgiref.sync import sync_to_async
from django.core.cache import cache
import json
import uuid


class PrivateChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        self.other_user_id = str(self.scope["url_route"]["kwargs"]["userId"])
        
        # Ensure IDs are handled as integers for sorting, then strings for the name
        try:
            ids = sorted([int(self.user.id), int(self.other_user_id)])
            self.room_name = f"private_{ids[0]}_{ids[1]}"
        except (ValueError, TypeError):
            await self.close()
            return

        # ✅ Mark online with a longer timeout or heartbeat logic
        cache.set(f"user_online_{self.user.id}", True, timeout=3600)

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        # ✅ Notify others in this specific room
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "presence_message",
                "user_id": str(self.user.id), # Cast to string
                "status": "online"
            }
        )

    async def disconnect(self, close_code):
        # Only delete from cache if this is the last remaining connection 
        # (Optional: for simplicity, keep your current delete)
        cache.delete(f"user_online_{self.user.id}")

        # Check if room_name exists (in case connect failed early)
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
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message_text = data.get("message")
        if not message_text:
            return

        message_id = str(uuid.uuid4())

        # ✅ Save to DynamoDB
        # Using thread_sensitive=False is good for I/O bound tasks like DB writes
        item = await sync_to_async(save_message_to_dynamo, thread_sensitive=False)(
            self.room_name,
            str(self.user.id),
            self.other_user_id,
            message_text,
            message_id
        )

        receiver_online = cache.get(f"user_online_{self.other_user_id}", False)
        
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "chat_message",
                "message_data": item, # Nesting helps separate metadata from the message
                "receiver_online": receiver_online
            }
        )

    async def chat_message(self, event):
        # Extract only what the frontend needs
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