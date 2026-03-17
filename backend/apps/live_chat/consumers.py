from channels.generic.websocket import AsyncWebsocketConsumer
from dynamodb.services.live_chat_history import save_message_to_dynamo
from asgiref.sync import sync_to_async
from django.core.cache import cache

import json

class PrivateChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return

        self.other_user_id = str(self.scope["url_route"]["kwargs"].get("userId"))
        ids = sorted([int(self.user.id), int(self.other_user_id)])
        self.room_name = f"private_{ids[0]}_{ids[1]}"
        
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get("message")

        # 1. Save to DynamoDB
        item = await sync_to_async(save_message_to_dynamo)(
            self.room_name, self.user.id, self.other_user_id, message_text
        )

        # 2. Internal Notification (Simplified)
        receiver_online = cache.get(f"user_online_{self.other_user_id}")

        # 3. Broadcast
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "chat_message",
                **item
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))