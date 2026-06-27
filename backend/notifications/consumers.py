import json
from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Parse query string to extract user_id
        # Example WebSocket URL: ws://localhost:8000/ws/notifications/?user_id=1
        query_string = self.scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        user_id_list = query_params.get("user_id")

        if user_id_list:
            self.user_id = user_id_list[0]
            self.group_name = f"user_{self.user_id}"
            
            # Join user's private notification group
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()
        else:
            # Reject connection if no user_id is provided
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    # Handler for user-level notification broadcasts
    async def send_notification(self, event):
        notification_id = event.get('id')
        title = event.get('title')
        message = event.get('message')
        created_at = event.get('created_at')

        # Send details to the client WebSocket
        await self.send(text_data=json.dumps({
            'id': notification_id,
            'title': title,
            'message': message,
            'created_at': created_at
        }))
