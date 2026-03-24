from rest_framework import serializers
from .models import Notification

from rest_framework import serializers
from .models import Notification
from django.contrib.auth.models import User
from apps.jobs.models import JobApplication

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
    
class UpdateApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['status', 'scheduled_at', 'meeting_link']

    def validate(self, attrs):
        request = self.context.get('request')
        application = self.instance # The application being updated
        
        # 1. Permission Check: Only HR of the company that posted the job
        try:
            hr_profile = request.user.hr_profile
        except AttributeError:
            raise serializers.ValidationError("Only HR users can update applications.")

        if application.job.company != hr_profile.company:
            raise serializers.ValidationError("You do not have permission to manage this job's applicants.")

        # 2. Logic Check: If status is SCHEDULED, ensure a time is provided
        if attrs.get('status') == 'SCHEDULED' and not attrs.get('scheduled_at'):
            raise serializers.ValidationError({"scheduled_at": "This field is required when scheduling an interview."})

        return attrs