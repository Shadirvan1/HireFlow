import smtplib
import os
from email.message import EmailMessage

def check_brevo_smtp():
    # Fetch credentials from your environment
    # Ensure these match the keys in your .env / Secret exactly
    smtp_server = "smtp-relay.brevo.com"
    smtp_port = 587
    smtp_user = os.getenv("EMAIL_HOST_USER")
    smtp_pass = os.getenv("BREVO_API_KEY") # Or os.getenv("EMAIL_HOST_PASSWORD")
    sender_email = os.getenv("DEFAULT_FROM_EMAIL", "notification@hireflow.com")

    print(f"--- Testing Connection for {smtp_user} ---")

    try:
        # 1. Initialize Connection
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.set_debuglevel(1) # This shows the raw conversation with Brevo
        
        # 2. Start TLS (Mandatory for Brevo)
        server.starttls()
        
        # 3. Attempt Login
        print("Attempting login...")
        server.login(smtp_user, smtp_pass)
        print("\n✅ SUCCESS: SMTP Authentication accepted!")

        # 4. Optional: Send a test ping
        # server.noop() 
        
        server.quit()
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"\n❌ AUTHENTICATION FAILED (535): {e}")
        print("Check if your SMTP Key is active and your User is correct.")
    except Exception as e:
        print(f"\n❌ CONNECTION ERROR: {e}")
    
    return False

if __name__ == "__main__":
    check_brevo_smtp()