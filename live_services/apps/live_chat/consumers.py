import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.cache import cache
from .models import Message
from .tasks import send_notification_to_backend

class PrivateChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        # Get the other user ID from URL
        self.other_user_id = str(
            self.scope["url_route"]["kwargs"].get("userId")
            or self.scope["url_route"]["kwargs"].get("room_name")
        )

        # Create a unique room name for these two users
        ids = sorted([int(self.user.id), int(self.other_user_id)])
        self.room_group_name = f"private_{ids[0]}_{ids[1]}"
        self.presence_group_name = "presence_group"

        # Update cache and notify others
        await self.increment_online_count(self.user.id)

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_add(self.presence_group_name, self.channel_name)

        await self.accept()

        # Broadcast online status
        await self.channel_layer.group_send(
            self.presence_group_name,
            {
                "type": "user_status",
                "user_id": self.user.id,
                "status": "online"
            }
        )

    async def disconnect(self, close_code):
        # Remove from groups
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.channel_layer.group_discard(self.presence_group_name, self.channel_name)

        # Clean up cache
        still_online = await self.decrement_online_count(self.user.id)

        # Only notify offline if this was the last open tab for this user
        if not still_online:
            await self.channel_layer.group_send(
                self.presence_group_name,
                {
                    "type": "user_status",
                    "user_id": self.user.id,
                    "status": "offline"
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # Handle Heartbeat/Ping from frontend to keep status alive
        if data.get("type") == "heartbeat":
            await self.refresh_online_status(self.user.id)
            return

        message_text = data.get("message")
        if not message_text:
            return

        # 1. Save to DB
        message = await self.save_message(
            self.user.id,
            self.other_user_id,
            message_text
        )

        # 2. Refresh own status (activity implies online)
        await self.refresh_online_status(self.user.id)

        # 3. Check if receiver is online to decide on Celery task
        receiver_online = await self.is_user_online(self.other_user_id)
        print(receiver_online)
        
        if not receiver_online:
            send_notification_to_backend.delay(
                receiver_id=self.other_user_id,
                sender_id=self.user.id,
                message_text=message_text
            )

        # 4. Send message to room group
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

    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            "type": "presence",
            "user_id": event["user_id"],
            "status": event["status"]
        }))



    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message_text):
        return Message.objects.create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message_text
        )

    @database_sync_to_async
    def increment_online_count(self, user_id):
        u_id = str(user_id)
        count_key = f"user_online_count_{u_id}"
        status_key = f"user_online_{u_id}"

        count = cache.get(count_key, 0)
        cache.set(count_key, count + 1, timeout=None)

        cache.set(status_key, True, timeout=1)

    @database_sync_to_async
    def decrement_online_count(self, user_id):
        u_id = str(user_id)
        count_key = f"user_online_count_{u_id}"
        status_key = f"user_online_{u_id}"
        
        count = cache.get(count_key, 0)

        if count <= 1:
            cache.delete(count_key)
            cache.delete(status_key)
            return False
        else:
            cache.set(count_key, count - 1, timeout=None)
            return True

    @database_sync_to_async
    def refresh_online_status(self, user_id):
        
        cache.set(f"user_online_{str(user_id)}", True, timeout=120)

    @database_sync_to_async
    def is_user_online(self, user_id):

        return cache.get(f"user_online_{str(user_id)}") is True