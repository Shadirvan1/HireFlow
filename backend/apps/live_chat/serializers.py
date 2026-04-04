from rest_framework import serializers


class AIChatSerializer(serializers.Serializer):
    message = serializers.CharField()

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        if len(value) > 400:
            raise serializers.ValidationError(
                "Message is too long. Maximum length is 1000 characters."
            )
        if len(value) < 1:
            raise serializers.ValidationError(
                "Message is too short. Minimum length is 1 character."
            )
        return value
