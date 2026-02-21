from django.conf import settings
from django.core.mail import EmailMultiAlternatives
import logging

logger = logging.getLogger(__name__)


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
                                    
                                    <p>Please use the approval code below to activate your account:</p>
                                    
                                    <div style="text-align:center; margin: 20px 0;">
                                        <span style="
                                            display:inline-block;
                                            background:#2563eb;
                                            color:white;
                                            padding:15px 30px;
                                            font-size:22px;
                                            font-weight:bold;
                                            border-radius:8px;
                                            letter-spacing:3px;">
                                            {user.hr_password}
                                        </span>
                                    </div>

                                    <p>This code may expire soon. Please complete your login process.</p>

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

        logger.info(f"Approval email sent to {user.email}")

    except Exception as e:
        logger.error(f"Failed to send approval email to {user.email}: {str(e)}")
        raise