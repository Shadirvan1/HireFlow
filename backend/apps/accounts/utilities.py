import os
import random

from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

User = get_user_model()

url = os.getenv("FRONT_END_URL_VERIFY")
FRONTEND_URL = os.getenv("FRONTEND_URL")
FRONT_END_URL_VERIFY = os.getenv("FRONT_END_URL_VERIFY")


@shared_task
def send_verification_email(user_id):
    """
    Sends account verification email. Accepts user_id to prevent serialization issues.
    """
    try:
        # Fetch the user inside the task
        user = User.objects.get(pk=user_id)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verification_link = f"{FRONT_END_URL_VERIFY}/{uid}/{token}/"

        subject = "Verify Your HireFlow Account"

        html_content = f"""
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
                                    <p>Thank you for registering. Please confirm your email to activate your account.</p>
                                    <p style="text-align:center;">
                                        <a href="{verification_link}" style="background-color:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Verify Email Address</a>
                                    </p>
                                    <p>If the button doesn't work, copy and paste this link:</p>
                                    <p style="word-break: break-all;">{verification_link}</p>
                                    <hr>
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

        text_content = (
            f"Hi {user.username},\n\nVerify your email here: {verification_link}"
        )

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

        return f"Verification email sent to {user.email}"

    except User.DoesNotExist:
        return f"User {user_id} not found"
    except Exception as e:
        print(f"Error: {str(e)}")
        raise


@shared_task
def send_password_reset_email(user_id):
    """
    Sends a professional password reset email.
    """

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        pass

    try:
        uid = urlsafe_base64_encode(force_bytes(user.id))
        token = default_token_generator.make_token(user)

        reset_link = f"{FRONTEND_URL}/reset-password/{uid}/{token}/"

        subject = "Reset Your HireFlow Password"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;padding:40px;">
                            
                            <tr>
                                <td align="center">
                                    <h2 style="color:#111827;margin-bottom:10px;">Reset Your Password 🔐</h2>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <p style="font-size:16px;color:#374151;">
                                        Hi <strong>{user.username}</strong>,
                                    </p>

                                    <p style="font-size:15px;color:#374151;line-height:1.6;">
                                        We received a request to reset your password for your <strong>HireFlow</strong> account.
                                    </p>

                                    <p style="font-size:15px;color:#374151;line-height:1.6;">
                                        Click the button below to set a new password. This link will expire automatically for security reasons.
                                    </p>

                                    <p style="text-align:center;margin:30px 0;">
                                        <a href="{reset_link}"
                                           style="background-color:#2563eb;
                                                  color:#ffffff;
                                                  padding:14px 28px;
                                                  text-decoration:none;
                                                  border-radius:6px;
                                                  font-weight:bold;
                                                  display:inline-block;">
                                            Reset Password
                                        </a>
                                    </p>

                                    <p style="font-size:14px;color:#6b7280;">
                                        If the button above does not work, copy and paste this link into your browser:
                                    </p>

                                    <p style="font-size:13px;color:#6b7280;word-break:break-all;">
                                        {reset_link}
                                    </p>

                                    <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">

                                    <p style="font-size:13px;color:#9ca3af;">
                                        If you did not request a password reset, you can safely ignore this email.
                                        Your password will not change unless you create a new one.
                                    </p>

                                    <p style="font-size:13px;color:#9ca3af;margin-top:20px;">
                                        © {user.username} | HireFlow
                                    </p>
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

We received a request to reset your HireFlow password.

Reset your password using the link below:
{reset_link}

If you did not request this, you can ignore this email.

Thanks,
HireFlow Team
"""

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )

        email.attach_alternative(html_content, "text/html")
        email.send()

        print(f"Password reset email sent to {user.email}")

    except Exception as e:
        print(f"Failed to send password reset email to {user.email}: {str(e)}")
        raise


@shared_task
def send_delete_account_otp(user_id, username, email):
    """
    Generates OTP, stores in Redis cache, sends deletion confirmation email.
    """
    try:
        # Generate 6 digit OTP
        otp = str(random.randint(100000, 999999))

        # Store in Redis with 5 minute expiry
        cache_key = f"delete_account_otp_{user_id}"
        cache.set(cache_key, otp, timeout=300)

        subject = "HireFlow Account Deletion OTP"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;padding:40px;">

                            <tr>
                                <td align="center">
                                    <h2 style="color:#dc2626;margin-bottom:10px;">Account Deletion Request ⚠️</h2>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <p style="font-size:16px;color:#374151;">
                                        Hi <strong>{username}</strong>,
                                    </p>

                                    <p style="font-size:15px;color:#374151;line-height:1.6;">
                                        We received a request to <strong>permanently delete</strong> your HireFlow account.
                                        Use the OTP below to confirm. This code expires in <strong>5 minutes</strong>.
                                    </p>

                                    <p style="text-align:center;margin:30px 0;">
                                        <span style="background-color:#fef2f2;
                                                     color:#dc2626;
                                                     padding:16px 40px;
                                                     border-radius:8px;
                                                     font-size:32px;
                                                     font-weight:bold;
                                                     letter-spacing:8px;
                                                     display:inline-block;
                                                     border:2px dashed #dc2626;">
                                            {otp}
                                        </span>
                                    </p>

                                    <p style="font-size:14px;color:#6b7280;text-align:center;">
                                        This OTP is valid for <strong>5 minutes</strong> only.
                                    </p>

                                    <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">

                                    <p style="font-size:13px;color:#9ca3af;">
                                        If you did not request account deletion, please ignore this email.
                                        Your account will remain safe.
                                    </p>

                                    <p style="font-size:13px;color:#9ca3af;margin-top:20px;">
                                        © HireFlow
                                    </p>
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
Hi {username},

Your HireFlow account deletion OTP is: {otp}

This code expires in 5 minutes.

If you did not request this, ignore this email.

© HireFlow
"""

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

    except Exception as e:
        print(f"Failed to send delete OTP to {email}: {str(e)}")
        raise
