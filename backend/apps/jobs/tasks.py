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
