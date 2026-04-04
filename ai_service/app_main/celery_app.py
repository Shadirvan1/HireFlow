import os
from celery import Celery

REDIS_HOST = os.getenv("REDIS_HOST")



app = Celery(
    "ai_service",
    broker=REDIS_HOST,
    backend=REDIS_HOST,
    include=['utilities.celery_n8n_call']
)

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_default_queue='ai_queue',
    broker_use_ssl={
        'ssl_cert_reqs': None 
    },
    redis_backend_use_ssl={
        'ssl_cert_reqs': None
    }
)

app.autodiscover_tasks(['app_main'])