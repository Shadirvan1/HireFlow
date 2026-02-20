from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import logging
import os
logger = logging.getLogger(__name__)
url = os.getenv("FRONT_END_URL")
def send_verification_email(user):
    """
    Sends account verification email using normal SMTP.
    """
    try:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verification_link = f"{url}/{uid}/{token}/"

        subject = "Verify Your HireFlow Account"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" style="background: #ffffff; padding: 30px; border-radius: 8px;">
                            <tr>
                                <td>
                                    <h2 style="color: #1f2937;">Welcome to HireFlow 👋</h2>
                                    <p>Hi <strong>{user.username}</strong>,</p>
                                    <p>Thank you for registering with HireFlow. Please confirm your email to activate your account.</p>
                                    <p style="text-align:center;">
                                        <a href="{verification_link}" style="background-color:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Verify Email Address</a>
                                    </p>
                                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                                    <p style="word-break: break-all;">{verification_link}</p>
                                    <hr>
                                    <p>If you did not create this account, ignore this email.</p>
                                    <p>© HireFlow</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        text_content = f"""
        Hi {user.username},

        Please verify your email by clicking the link below:

        {verification_link}

        If you did not register, ignore this email.
        """

        # Create email
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

        logger.info(f"Verification email sent to {user.email}")

    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
        raise
