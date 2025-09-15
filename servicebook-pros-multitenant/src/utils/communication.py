import os
from twilio.rest import Client
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import logging

# Twilio Configuration - Use environment variables
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "your_twilio_account_sid")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "your_twilio_auth_token")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+1234567890")

# SendGrid Configuration - Use environment variables
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "your_sendgrid_api_key")

# Initialize clients
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
sendgrid_client = SendGridAPIClient(api_key=SENDGRID_API_KEY)

logger = logging.getLogger(__name__)

class CommunicationService:
    
    @staticmethod
    def send_sms(to_phone, message_body, from_phone=TWILIO_PHONE_NUMBER):
        """
        Send SMS using Twilio
        """
        try:
            # Ensure phone number is in E.164 format
            if not to_phone.startswith('+'):
                # Assume US number if no country code
                if len(to_phone) == 10:
                    to_phone = f"+1{to_phone}"
                elif len(to_phone) == 11 and to_phone.startswith('1'):
                    to_phone = f"+{to_phone}"
                else:
                    to_phone = f"+1{to_phone}"
            
            message = twilio_client.messages.create(
                body=message_body,
                from_=from_phone,
                to=to_phone
            )
            
            logger.info(f"SMS sent successfully. SID: {message.sid}")
            return {
                'success': True,
                'message_sid': message.sid,
                'status': message.status,
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Failed to send SMS: {str(e)}")
            return {
                'success': False,
                'message_sid': None,
                'status': 'failed',
                'error': str(e)
            }
    
    @staticmethod
    def send_email(to_email, subject, html_content, from_email="noreply@servicebookpros.com", from_name="ServiceBook Pros"):
        """
        Send email using SendGrid
        """
        try:
            message = Mail(
                from_email=(from_email, from_name),
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )
            
            response = sendgrid_client.send(message)
            
            logger.info(f"Email sent successfully. Status: {response.status_code}")
            return {
                'success': True,
                'status_code': response.status_code,
                'message_id': response.headers.get('X-Message-Id'),
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return {
                'success': False,
                'status_code': None,
                'message_id': None,
                'error': str(e)
            }
    
    @staticmethod
    def format_phone_number(phone):
        """
        Format phone number to E.164 format
        """
        # Remove all non-digit characters
        digits = ''.join(filter(str.isdigit, phone))
        
        # Handle US numbers
        if len(digits) == 10:
            return f"+1{digits}"
        elif len(digits) == 11 and digits.startswith('1'):
            return f"+{digits}"
        else:
            # Return as-is if already formatted or international
            return phone if phone.startswith('+') else f"+1{digits}"
    
    @staticmethod
    def validate_email(email):
        """
        Basic email validation
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_phone(phone):
        """
        Basic phone validation
        """
        digits = ''.join(filter(str.isdigit, phone))
        return len(digits) >= 10
    
    @staticmethod
    def create_email_template(template_type, **kwargs):
        """
        Create email templates for different communication types
        """
        templates = {
            'appointment_confirmation': {
                'subject': 'Appointment Confirmation - ServiceBook Pros',
                'html': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Appointment Confirmed</h2>
                    <p>Dear {kwargs.get('customer_name', 'Valued Customer')},</p>
                    <p>Your appointment has been confirmed for:</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <strong>Date:</strong> {kwargs.get('date', 'TBD')}<br>
                        <strong>Time:</strong> {kwargs.get('time', 'TBD')}<br>
                        <strong>Service:</strong> {kwargs.get('service', 'Service Call')}<br>
                        <strong>Technician:</strong> {kwargs.get('technician', 'TBD')}
                    </div>
                    <p>If you need to reschedule or have any questions, please reply to this email or call us.</p>
                    <p>Thank you for choosing ServiceBook Pros!</p>
                </div>
                """
            },
            'estimate_ready': {
                'subject': 'Your Estimate is Ready - ServiceBook Pros',
                'html': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Your Estimate is Ready</h2>
                    <p>Dear {kwargs.get('customer_name', 'Valued Customer')},</p>
                    <p>We've prepared your estimate for the requested service.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <strong>Estimate Total:</strong> ${kwargs.get('amount', '0.00')}<br>
                        <strong>Service:</strong> {kwargs.get('service', 'Service Call')}
                    </div>
                    <p>Please review the estimate and let us know if you'd like to proceed with scheduling the work.</p>
                    <p>Thank you for choosing ServiceBook Pros!</p>
                </div>
                """
            },
            'job_completion': {
                'subject': 'Service Completed - ServiceBook Pros',
                'html': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Service Completed</h2>
                    <p>Dear {kwargs.get('customer_name', 'Valued Customer')},</p>
                    <p>We've successfully completed the service at your property.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <strong>Service:</strong> {kwargs.get('service', 'Service Call')}<br>
                        <strong>Technician:</strong> {kwargs.get('technician', 'Our Team')}<br>
                        <strong>Completion Date:</strong> {kwargs.get('date', 'Today')}
                    </div>
                    <p>If you have any questions about the work performed or need additional service, please don't hesitate to contact us.</p>
                    <p>Thank you for choosing ServiceBook Pros!</p>
                </div>
                """
            },
            'general': {
                'subject': kwargs.get('subject', 'Message from ServiceBook Pros'),
                'html': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">ServiceBook Pros</h2>
                    <p>Dear {kwargs.get('customer_name', 'Valued Customer')},</p>
                    <div style="margin: 20px 0;">
                        {kwargs.get('message', 'Thank you for your business!')}
                    </div>
                    <p>If you have any questions, please reply to this email or call us.</p>
                    <p>Thank you for choosing ServiceBook Pros!</p>
                </div>
                """
            }
        }
        
        template = templates.get(template_type, templates['general'])
        return template['subject'], template['html']
    
    @staticmethod
    def create_sms_template(template_type, **kwargs):
        """
        Create SMS templates for different communication types
        """
        templates = {
            'appointment_confirmation': f"ServiceBook Pros: Your appointment is confirmed for {kwargs.get('date', 'TBD')} at {kwargs.get('time', 'TBD')}. Technician: {kwargs.get('technician', 'TBD')}. Reply STOP to opt out.",
            
            'appointment_reminder': f"ServiceBook Pros: Reminder - Your appointment is tomorrow at {kwargs.get('time', 'TBD')}. We'll see you then! Reply STOP to opt out.",
            
            'technician_enroute': f"ServiceBook Pros: Your technician {kwargs.get('technician', 'is')} is on the way and will arrive in approximately {kwargs.get('eta', '30')} minutes. Reply STOP to opt out.",
            
            'estimate_ready': f"ServiceBook Pros: Your estimate is ready! Total: ${kwargs.get('amount', '0.00')}. Please call us to discuss or schedule the work. Reply STOP to opt out.",
            
            'job_completion': f"ServiceBook Pros: Service completed successfully! Thank you for choosing us. If you have any questions, please call. Reply STOP to opt out.",
            
            'general': kwargs.get('message', 'Thank you for choosing ServiceBook Pros! Reply STOP to opt out.')
        }
        
        return templates.get(template_type, templates['general'])

