import requests
import os
import json
from app_main.celery_app import app 

@app.task(bind=True, max_retries=3)
def trigger_n8n_webhook_task(self, payload):
    app_id = payload.get('application_id', 'Unknown')
    
    print(f"\n Richards-Worker-Log: [RECEIVED] Starting task for App ID: {app_id}")
    
    try:
        url = os.getenv("N8N_WEBHOOK_URL")
        n8n_pass = os.getenv("N8N_PASS")
        
        # 1. Check Environment Variables
        if not url:
            print(f" Richards-Worker-Log: [ERROR] N8N_WEBHOOK_URL is missing in environment!")
            return "Failed: No Webhook URL"
        
        print(f" Richards-Worker-Log: [INFO] Target URL: {url}")
        print(f" Richards-Worker-Log: [INFO] Payload: {json.dumps(payload, indent=2)}")

        # 2. Attempt the Request
        headers = {"X-N8N-API-KEY": n8n_pass}
        
        print(f" Richards-Worker-Log: [SENDING] Dispatching POST request to n8n...")
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        # 3. Check Response
        print(f" Richards-Worker-Log: [RESPONSE] Status Code: {response.status_code}")
        
        response.raise_for_status()
        
        print(f" Richards-Worker-Log: [SUCCESS] Webhook accepted for App ID: {app_id}")
        return f"Webhook success for App ID: {app_id}"
        
    except requests.exceptions.RequestException as req_exc:
        print(f" Richards-Worker-Log: [NETWORK ERROR] Request failed: {str(req_exc)}")
        # Retry logic
        print(f" Richards-Worker-Log: [RETRY] Attempting retry in 60s (Retry {self.request.retries + 1}/3)")
        raise self.retry(exc=req_exc, countdown=60)
        
    except Exception as exc:
        print(f" Richards-Worker-Log: [FATAL ERROR] Unexpected error: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)