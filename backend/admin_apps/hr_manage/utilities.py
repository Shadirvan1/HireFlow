from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from apps.accounts.models import User


@shared_task
def send_hr_approval_email(user):
    """
    Sends HR approval email with 6-digit approval token.
    """

    try:
        subject = "Your HireFlow Account Has Been Approved 🎉"

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
                                    <h2 style="color: #16a34a;">Congratulations {user.username} 🎉</h2>
                                    
                                    <p>Your HR account has been approved by the HireFlow Admin.</p>
                                    
                


                                    <hr>
                                    <p>If you did not request this, please contact support.</p>
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
        Hi {user.hr_password},

        Your HireFlow HR account has been approved.

        Your approval code is:

        {user.hr_password}

        Please use this code to activate your account.

        If you did not request this, contact support.

        - HireFlow Team
        """

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )

        email.attach_alternative(html_content, "text/html")
        email.send()

    except Exception as e:
        print(f"Failed to send approval email to {user.email}: {str(e)}")
        raise


@shared_task
def send_hr_rejection_email(user_id):
    """
    Sends HR rejection email if the application is declined.
    """
    try:
        user = User.objects.get(id=user_id)
        subject = "Update regarding your HireFlow HR Application"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 20px;">
            <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" style="background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <tr>
                                <td>
                                    <h2 style="color: #1e293b; margin-bottom: 24px;">Hi {user.username},</h2>
                                    
                                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                                        Thank you for your interest in joining HireFlow. After carefully reviewing your HR profile and company details, we regret to inform you that we cannot approve your application at this time.
                                    </p>
                                    
                                    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 25px 0;">
                                        <p style="color: #64748b; font-size: 14px; margin: 0;">
                                            <strong>Common reasons for rejection include:</strong><br>
                                            • Incomplete or unverified company documentation.<br>
                                            • Invalid LinkedIn profile or professional certifications.<br>
                                            • Profile details do not match company records.
                                        </p>
                                    </div>

                                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                                        If you believe this was a mistake, or if you would like to provide additional information, please feel free to reach out to our support team.
                                    </p>

                                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                                        This is an automated message from the HireFlow Administration. 
                                        Please do not reply to this email.
                                    </p>
                                    <p style="color: #64748b; font-size: 12px; text-align: center; font-weight: bold;">© HireFlow</p>
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

        Thank you for your interest in joining HireFlow. 

        After reviewing your HR profile, we regret to inform you that we cannot approve your account at this time. This is usually due to incomplete documentation or verification issues.

        If you believe this is an error, please contact our support team.

        - HireFlow Administration
        """

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )

        email.attach_alternative(html_content, "text/html")
        email.send()

    except User.DoesNotExist:
        print(f"User with ID {user_id} not found.")
    except Exception as e:
        print(f"Failed to send rejection email: {str(e)}")
        raise
