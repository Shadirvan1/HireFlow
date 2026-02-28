import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "live_service_main.settings")

app = Celery("live_service_main")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()