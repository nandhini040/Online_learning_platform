from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification

@receiver(post_save, sender=Notification)
def broadcast_notification(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        if channel_layer:
            group_name = f"user_{instance.recipient.id}"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "send_notification",
                    "id": instance.id,
                    "title": instance.title,
                    "message": instance.message,
                    "created_at": instance.created_at.isoformat()
                }
            )
