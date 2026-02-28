from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache


@shared_task
def send_chat_notification(receiver_id, sender_name, message_text):

    # Check again before sending (important!)
    is_online = cache.get(f"user_online_{receiver_id}")

    if is_online:
        return  

    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return

    subject = f"New message from {sender_name}"
    message = f"You received a new message:\n\n{message_text}"

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )