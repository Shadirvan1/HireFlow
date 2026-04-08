import requests
import os
import json
from app_main.celery_app import app 

@app.task(bind=True, max_retries=3)
def trigger_n8n_webhook_task(self, payload):
    app_id = payload.get('application_id', 'Unknown')
    
    
    try:
        url = os.getenv("N8N_WEBHOOK_URL")
        n8n_pass = os.getenv("N8N_PASS")
        
        if not url:
            return "Failed: No Webhook URL"
        
       
        headers = {"X-N8N-API-KEY": n8n_pass}
        
      
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        response.raise_for_status()
        
        return f"Webhook success for App ID: {app_id}"
        
    except requests.exceptions.RequestException as req_exc:
       
        raise self.retry(exc=req_exc, countdown=60)
        
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)