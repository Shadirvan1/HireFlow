import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hireflow_main.settings")

app = Celery("hireflow_main")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()