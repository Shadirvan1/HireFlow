import boto3
import json
import os

def send_notification(user, title, body, data=None):
    """
    Push a notification message to SQS for web push (FCM WebPush)
    
    Args:
        user: User object with attribute fcm_token
        title: Notification title
        body: Notification body
        data: Optional dictionary of extra data
    """
    fcm_token = getattr(user, "fcm_token", None)
    if not fcm_token:
        return

    sqs = boto3.client(
        "sqs",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_NOTIFICATION_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_NOTIFICATION_KEY"),
        region_name=os.getenv("AWS_DEFAULT_REGION", "eu-north-1")
    )

    message = {
        "fcm_token": fcm_token,
        "title": title,
        "body": body,
        "data": data or {}
    }

    try:
        sqs.send_message(
            QueueUrl=os.getenv("SQS_URL"),
            MessageBody=json.dumps(message)
        )
    except Exception as e:
        print(f"Error sending message to SQS: {e}")