from celery import shared_task
import requests


@shared_task(bind=True, max_retries=3)
def send_notification_to_backend(self, receiver_id, sender_id, message_text):
    URL = "http://backend:8000/api/v1/management/add/notifications/"
    try:
        response = requests.post(
            URL,
            json={
                "user": receiver_id,
                "sender": sender_id,
                "title": "New Message",
                "message": message_text,
            },
            timeout=5
        )

        response.raise_for_status()
        print("✅ Notification sent to backend")

    except Exception as exc:
        print("❌ Backend request failed, retrying...")
        raise self.retry(exc=exc, countdown=10)