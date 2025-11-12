"""
Email handling and templates
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from jinja2 import Template
from .models import Member, MembershipRequest, MembershipAction
from .config import config


class EmailService:
    """Handles email sending"""
    
    def __init__(self):
        self.config = config
    
    def _send_email(self, to_email: str, subject: str, body_html: str, body_text: Optional[str] = None):
        """Send an email via SMTP"""
        msg = MIMEMultipart('alternative')
        msg['From'] = self.config.ORG_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add plain text version if provided, otherwise strip HTML
        if body_text:
            msg.attach(MIMEText(body_text, 'plain'))
        
        # Add HTML version
        msg.attach(MIMEText(body_html, 'html'))
        
        try:
            # Connect to SMTP server
            if self.config.SMTP_USE_TLS:
                server = smtplib.SMTP(self.config.SMTP_HOST, self.config.SMTP_PORT)
                server.starttls()
            else:
                server = smtplib.SMTP(self.config.SMTP_HOST, self.config.SMTP_PORT)
            
            # Login if credentials provided
            if self.config.SMTP_USERNAME and self.config.SMTP_PASSWORD:
                server.login(self.config.SMTP_USERNAME, self.config.SMTP_PASSWORD)
            
            # Send email
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def send_approval_request(self, request: MembershipRequest) -> bool:
        """Send approval request email to admin"""
        member = request.member
        action_text = "Indmeldelse" if request.action == MembershipAction.REGISTER else "Udmeldelse"
        
        approval_url = f"{self.config.BASE_URL}/approve/{request.approval_token}"
        reject_url = f"{self.config.BASE_URL}/reject/{request.approval_token}"
        
        subject = f"{action_text} - {member.get_full_name()}"
        
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                    .content {{ background-color: #f9f9f9; padding: 20px; }}
                    .member-info {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }}
                    .buttons {{ margin: 20px 0; text-align: center; }}
                    .button {{ display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 4px; font-weight: bold; }}
                    .approve {{ background-color: #4CAF50; color: white; }}
                    .reject {{ background-color: #f44336; color: white; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{action_text} anmodning</h1>
                    </div>
                    <div class="content">
                        <p>Der er en ny {action_text.lower()} anmodning fra:</p>
                        
                        <div class="member-info">
                            <strong>Navn:</strong> {member.get_full_name()}<br>
                            <strong>Email:</strong> {member.email}<br>
                            <strong>Telefon:</strong> {member.phone}<br>
                            <strong>Adresse:</strong> {member.address}<br>
                            <strong>Postnr/By:</strong> {member.postal_code} {member.city}
                        </div>
                        
                        <p>Klik på en af knapperne nedenfor for at godkende eller afvise denne anmodning:</p>
                        
                        <div class="buttons">
                            <a href="{approval_url}" class="button approve">Godkend</a>
                            <a href="{reject_url}" class="button reject">Afvis</a>
                        </div>
                        
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            Eller kopier disse links:<br>
                            Godkend: {approval_url}<br>
                            Afvis: {reject_url}
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return self._send_email(self.config.APPROVAL_EMAIL, subject, html_body)
    
    def send_municipality_notification(self, member: Member, action: MembershipAction) -> bool:
        """Send notification to municipality"""
        action_text = "indmeldt" if action == MembershipAction.REGISTER else "udmeldt"
        subject = f"Medlem {action_text} - {member.get_full_name()}"
        
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #2196F3; color: white; padding: 20px; }}
                    .content {{ background-color: #f9f9f9; padding: 20px; }}
                    .member-info {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{self.config.ORG_NAME} - Medlemsmeddelelse</h1>
                    </div>
                    <div class="content">
                        <p>Dette er en automatisk meddelelse om en medlemsændring:</p>
                        
                        <p><strong>Status:</strong> Medlem {action_text}</p>
                        
                        <div class="member-info">
                            <strong>Navn:</strong> {member.get_full_name()}<br>
                            <strong>Email:</strong> {member.email}<br>
                            <strong>Telefon:</strong> {member.phone}<br>
                            <strong>Adresse:</strong> {member.address}<br>
                            <strong>Postnr/By:</strong> {member.postal_code} {member.city}<br>
                            <strong>Dato:</strong> {member.approval_date.strftime('%d-%m-%Y') if member.approval_date else 'N/A'}
                        </div>
                        
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            Dette er en automatisk email fra {self.config.ORG_NAME} medlemssystem.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return self._send_email(self.config.MUNICIPALITY_EMAIL, subject, html_body)
    
    def send_welcome_email(self, member: Member) -> bool:
        """Send welcome email to new member"""
        subject = f"Velkommen til {self.config.ORG_NAME}!"
        
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                    .content {{ background-color: #f9f9f9; padding: 20px; }}
                    .info-box {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Velkommen til {self.config.ORG_NAME}!</h1>
                    </div>
                    <div class="content">
                        <p>Kære {member.first_name},</p>
                        
                        <p>Velkommen som nyt medlem af {self.config.ORG_NAME}! Din indmeldelse er nu godkendt og registreret.</p>
                        
                        <div class="info-box">
                            <h3>Dine medlemsoplysninger:</h3>
                            <strong>Navn:</strong> {member.get_full_name()}<br>
                            <strong>Email:</strong> {member.email}<br>
                            <strong>Medlems-ID:</strong> {member.id}
                        </div>
                        
                        <p>Hvis du har spørgsmål eller brug for hjælp, er du velkommen til at kontakte os på {self.config.ORG_EMAIL}.</p>
                        
                        <p>Med venlig hilsen,<br>
                        {self.config.ORG_NAME}</p>
                        
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            Dette er en automatisk email. Svar venligst ikke på denne mail.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return self._send_email(member.email, subject, html_body)
    
    def send_cancellation_confirmation(self, member: Member) -> bool:
        """Send cancellation confirmation email"""
        subject = f"Bekræftelse på udmeldelse fra {self.config.ORG_NAME}"
        
        html_body = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #FF9800; color: white; padding: 20px; text-align: center; }}
                    .content {{ background-color: #f9f9f9; padding: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Udmeldelse bekræftet</h1>
                    </div>
                    <div class="content">
                        <p>Kære {member.first_name},</p>
                        
                        <p>Din udmeldelse fra {self.config.ORG_NAME} er nu godkendt og registreret.</p>
                        
                        <p>Vi beklager, at du forlader os, og håber at du har haft en god oplevelse.</p>
                        
                        <p>Hvis du har spørgsmål, er du velkommen til at kontakte os på {self.config.ORG_EMAIL}.</p>
                        
                        <p>Med venlig hilsen,<br>
                        {self.config.ORG_NAME}</p>
                        
                        <p style="color: #666; font-size: 12px; margin-top: 30px;">
                            Dette er en automatisk email. Svar venligst ikke på denne mail.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return self._send_email(member.email, subject, html_body)
