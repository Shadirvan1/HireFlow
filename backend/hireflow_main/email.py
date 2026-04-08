import smtplib
import os
from email.message import EmailMessage


def check_brevo_smtp():
    # Fetch credentials from your environment
    # Ensure these match the keys in your .env / Secret exactly
    smtp_server = "smtp-relay.brevo.com"
    smtp_port = 587
    smtp_user = os.getenv("EMAIL_HOST_USER")
    smtp_pass = os.getenv("BREVO_API_KEY")  # Or os.getenv("EMAIL_HOST_PASSWORD")
    sender_email = os.getenv("DEFAULT_FROM_EMAIL", "notification@hireflow.com")


    try:
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.set_debuglevel(1)  
        server.starttls()

       
        server.login(smtp_user, smtp_pass)
    

        server.quit()
        return True

    except smtplib.SMTPAuthenticationError as e:

    except Exception as e:
        print(f"\n CONNECTION ERROR: {e}")

    return False


if __name__ == "__main__":
    check_brevo_smtp()
