from django.db import models
from apps.accounts.models import User


# Create your models here.
class Notification(models.Model):
    user = models.ForeignKey(User, related_name="notifications", on_delete=models.CASCADE,null=True)
    sender = models.ForeignKey(User, related_name="sent_notifications", on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)