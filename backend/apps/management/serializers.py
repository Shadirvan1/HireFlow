from rest_framework import serializers
from .models import Notification

from rest_framework import serializers
from .models import Notification
from django.contrib.auth.models import User


class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'sender_name',
            'receiver_name',
            'title',
            'message',
            'created_at',
            'is_read'
        ]

    def get_sender_name(self, obj):
        try:
            return User.objects.get(id=obj.sender_id).username
        except User.DoesNotExist:
            return None

    def get_receiver_name(self, obj):
        try:
            return User.objects.get(id=obj.user_id).username
        except User.DoesNotExist:
            return None
        
class NotificationCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = ["id",'user', 'sender', 'title', "is_read",'message',"created_at"]
        read_only_fields = ["id","is_read"]
    