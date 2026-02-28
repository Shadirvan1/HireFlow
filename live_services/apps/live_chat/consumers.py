import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
# Remove the User import if you aren't using it to avoid "Relation not exist" errors
from .models import Message

class PrivateChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]
        

        
        # Define a default to prevent the disconnect crash
        self.room_group_name = None 

        if self.user.is_anonymous:
            print("REJECTED: Anonymous User")
            await self.close()
            return
        
        # MATCH YOUR ROUTING: If your path is /ws/chat/<userId>/
        # your kwarg is likely 'userId', not 'room_name'
        self.other_user_id = self.scope["url_route"]["kwargs"].get("userId") or \
                             self.scope["url_route"]["kwargs"].get("room_name")

        ids = sorted([int(self.user.id), int(self.other_user_id)])
        self.room_group_name = f"private_{ids[0]}_{ids[1]}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"ACCEPTED: User {self.user.id} joined {self.room_group_name}")

    async def disconnect(self, close_code):
        if self.room_group_name: # Only discard if it was created
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_text = data.get("message")

            # Fallback for username
            sender_name = getattr(self.user, 'username', f"User_{self.user.id}")
            


            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message_text,
                    "sender": sender_name,
                }
            )

            # 2. Save to DB 
            await self.save_message(self.user.id, self.other_user_id, message_text)

        except Exception as e:
            print(f"ERROR in receive: {e}")

    async def chat_message(self, event):
        # This is what actually sends data back to React
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender": event["sender"],
        }))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message_text):
        return Message.objects.create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message=message_text
        )