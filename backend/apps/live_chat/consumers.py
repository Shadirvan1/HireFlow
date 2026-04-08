import json
import uuid

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache

from dynamodb.services.live_chat_history import save_message_to_dynamo


class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        self.other_user_id = str(self.scope["url_route"]["kwargs"]["userId"])

        try:
            # Sort IDs to ensure both users join the same unique room string
            ids = sorted([int(self.user.id), int(self.other_user_id)])
            self.room_name = f"private_{ids[0]}_{ids[1]}"
        except (ValueError, TypeError):
            await self.close()
            return

        # Track online status in Redis cache
        cache.set(f"user_online_{self.user.id}", True, timeout=3600)

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        # Send initial presence status of the other user
        other_online = cache.get(f"user_online_{self.other_user_id}", False)
        await self.send(
            text_data=json.dumps(
                {
                    "type": "presence",
                    "user_id": str(self.other_user_id),
                    "status": "online" if other_online else "offline",
                }
            )
        )

        # Broadcast to the group that this user is now online
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "presence_message",
                "user_id": str(self.user.id),
                "status": "online",
            },
        )

    async def disconnect(self, close_code):
        if not self.user.is_anonymous:
            cache.delete(f"user_online_{self.user.id}")

        if hasattr(self, "room_name"):
            # Broadcast that the user has gone offline
            await self.channel_layer.group_send(
                self.room_name,
                {
                    "type": "presence_message",
                    "user_id": str(self.user.id),
                    "status": "offline",
                },
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

        # Save to DynamoDB. 
        # IMPORTANT: Ensure 'save_message_to_dynamo' returns the dict 'item'
        item = await sync_to_async(save_message_to_dynamo, thread_sensitive=False)(
            self.room_name,
            str(self.user.id),
            self.other_user_id,
            message_text,
            message_id,
        )

        # Broadcast the message to the room group
        await self.channel_layer.group_send(
            self.room_name, {"type": "chat_message", "message_data": item}
        )

    async def chat_message(self, event):
        """
        Receive message from room group and send to WebSocket.
        """
        message_data = event.get("message_data")
        
        # CRITICAL FIX: Guard against NoneType if DynamoDB save failed or didn't return
        if message_data is None:
            return 

        await self.send(
            text_data=json.dumps({
                "type": "chat", 
                **message_data  # Unpacking the dictionary safely
            })
        )

    async def presence_message(self, event):
        """
        Receive presence update from room group and send to WebSocket.
        """
        await self.send(
            text_data=json.dumps(
                {
                    "type": "presence",
                    "user_id": event["user_id"],
                    "status": event["status"],
                }
            )
        )