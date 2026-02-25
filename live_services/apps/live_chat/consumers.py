import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        
        # DEBUG PRINTS
        print(f"DEBUG: User in scope: {self.scope.get('user')}")
        print(f"DEBUG: Is Authenticated: {self.scope.get('user').is_authenticated}")
    
        if self.scope["user"].is_authenticated:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            print("DEBUG: Connection rejected because user is not authenticated.")
            await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # Broadcast message to the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user': self.scope["user"].username
            }
        )

    async def chat_message(self, event):
        # Send message to the actual WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'user': event['user']
        }))