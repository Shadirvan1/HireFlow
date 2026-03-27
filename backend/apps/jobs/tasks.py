from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from apps.accounts.models import CandidateProfile
from .models import Job


@shared_task
def send_daily_job_notifications():


    jobs = Job.objects.filter(is_approve=True).order_by('-id')[:5]
    for candidate in CandidateProfile.objects.filter(is_active=True,):

        job_rows = ""
        for job in jobs:
            job_rows += f"""
            <tr>
                <td style="padding:10px;border-bottom:1px solid #eee;">
                    <strong>{job.title}</strong><br>
                    <span style="color:#555;">{job.location}</span>
                </td>
            </tr>
            """

        html_content = f"""
        <html>
        <body style="font-family:Arial, sans-serif;background:#f4f6f8;padding:20px;">
        
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center">

                        <table width="600" style="background:white;border-radius:8px;padding:30px;">
                            
                            <tr>
                                <td align="center">
                                    <h2 style="color:#2c3e50;">HireFlow Job Alerts 🚀</h2>
                                    <p style="color:#666;">New opportunities are waiting for you</p>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <p>Hello {candidate.first_name if hasattr(candidate,'first_name') else "Candidate"},</p>
                                    <p>Here are some new job opportunities that might interest you:</p>
                                </td>
                            </tr>

                            {job_rows}

                            <tr>
                                <td align="center" style="padding-top:20px;">
                                    <a href="http://localhost:5173/candidate/jobs" 
                                       style="background:#4CAF50;color:white;padding:12px 25px;
                                       text-decoration:none;border-radius:5px;">
                                       View More Jobs
                                    </a>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding-top:30px;font-size:12px;color:#888;text-align:center;">
                                    You are receiving this email because you signed up on HireFlow.<br>
                                    © 2026 HireFlow. All rights reserved.
                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        """

        email = EmailMultiAlternatives(
            subject="🚀 Daily Job Opportunities for You",
            body="New jobs are available for you. Please view this email in HTML format.",
            from_email="HireFlow <noreply@hireflow.com>",
            to=[candidate.user.email],
        )

        email.attach_alternative(html_content, "text/html")
        email.send()

    return "Emails sent successfully"


@shared_task
def send_hiring_email(application_id):
    """
    Sends a congratulatory email to a hired candidate.
    """
    from .models import JobApplication # Local import to avoid circular dependency
    
    try:
        app = JobApplication.objects.select_related('applicant__user', 'job__company').get(id=application_id)
        user = app.applicant.user
        job_name = app.job.title
        company_name = app.job.company.name

        subject = f"Congratulations! You are Hired for {job_name} at {company_name}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f0fdf4; padding: 20px;">
            <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" style="background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #bbf7d0;">
                            <tr>
                                <td align="center">
                                    <h1 style="color: #166534; margin-bottom: 5px;">You're Hired! 🎉</h1>
                                    <p style="font-size: 18px; color: #374151;">Great news, <strong>{user.username}</strong>!</p>
                                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                                    <p style="line-height: 1.6; color: #4b5563;">
                                        We are thrilled to officially offer you the position of <strong>{job_name}</strong> at <strong>{company_name}</strong>. 
                                        Our team was highly impressed with your performance and AI evaluation.
                                    </p>
                                    <p style="line-height: 1.6; color: #4b5563;">
                                        Our HR department will reach out to you shortly with the next steps, 
                                        onboarding details, and your official offer letter.
                                    </p>
                                    <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                                        <p style="margin: 0; font-weight: bold; color: #111827;">Welcome to the team!</p>
                                        <p style="margin: 5px 0 0 0; color: #6b7280;">Team {company_name} & HireFlow</p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        email = EmailMultiAlternatives(
            subject=subject,
            body=f"Hi {user.username}, congratulations! You have been hired for {job_name} at {company_name}.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        print(f"Hiring email sent to {user.email}")

    except Exception as e:
        print(f"Failed to send hiring email: {str(e)}")



@shared_task
def send_rejection_email(application_id):
    """
    Sends a polite rejection email to a candidate.
    """
    from .models import JobApplication

    try:
        app = JobApplication.objects.select_related('applicant__user', 'job__company').get(id=application_id)
        user = app.applicant.user
        job_name = app.job.title
        company_name = app.job.company.name

        subject = f"Update regarding your application for {job_name}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
            <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="600" style="background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <tr>
                                <td>
                                    <h2 style="color: #111827;">Application Update</h2>
                                    <p>Dear <strong>{user.username}</strong>,</p>
                                    <p style="line-height: 1.6; color: #374151;">
                                        Thank you for giving us the opportunity to review your application for the 
                                        <strong>{job_name}</strong> position at <strong>{company_name}</strong>.
                                    </p>
                                    <p style="line-height: 1.6; color: #374151;">
                                        After careful consideration and evaluation, we have decided to move forward with other 
                                        candidates who more closely match our current requirements.
                                    </p>
                                    <p style="line-height: 1.6; color: #374151;">
                                        We truly appreciate the time you invested in the interview process. 
                                        We wish you the very best in your job search and future professional endeavors.
                                    </p>
                                    <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;">
                                    <p style="font-size: 13px; color: #9ca3af;">Best regards,<br>Talent Acquisition Team<br>{company_name}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        email = EmailMultiAlternatives(
            subject=subject,
            body=f"Hi {user.username}, thank you for your interest in the {job_name} position at {company_name}. We have decided to move forward with other candidates.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        print(f"Rejection email sent to {user.email}")

    except Exception as e:
        print(f"Failed to send rejection email: {str(e)}")