"""
Communication service for ServiceBook Pros
Handles SMS via Twilio and Email via SendGrid
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional
from src.models.communication import (
    CommunicationLog, MessageTemplate, NotificationSettings,
    CommunicationType, CommunicationStatus
)
from src.models.user import db

class CommunicationService:
    """Service for handling SMS and Email communications"""
    
    def __init__(self):
        self.twilio_client = None
        self.sendgrid_client = None
        self._init_clients()
    
    def _init_clients(self):
        """Initialize Twilio and SendGrid clients"""
        try:
            # Twilio initialization (would use real credentials in production)
            # from twilio.rest import Client
            # self.twilio_client = Client(account_sid, auth_token)
            pass
        except Exception as e:
            print(f"Warning: Could not initialize Twilio client: {e}")
        
        try:
            # SendGrid initialization (would use real credentials in production)
            # import sendgrid
            # self.sendgrid_client = sendgrid.SendGridAPIClient(api_key)
            pass
        except Exception as e:
            print(f"Warning: Could not initialize SendGrid client: {e}")
    
    def send_sms(self, to_phone: str, message: str, company_id: int, 
                 job_id: Optional[int] = None, customer_id: Optional[int] = None) -> Dict:
        """Send SMS message"""
        try:
            # Get company notification settings
            settings = NotificationSettings.query.filter_by(company_id=company_id).first()
            
            if not settings or not settings.sms_enabled:
                return {'success': False, 'error': 'SMS not enabled for this company'}
            
            # In production, this would use Twilio
            # message = self.twilio_client.messages.create(
            #     body=message,
            #     from_=settings.twilio_phone_number,
            #     to=to_phone
            # )
            
            # For demo purposes, simulate successful send
            external_message_id = f"demo_sms_{datetime.utcnow().timestamp()}"
            
            # Log the communication
            comm_log = CommunicationLog(
                company_id=company_id,
                customer_id=customer_id,
                communication_type=CommunicationType.SMS,
                recipient_phone=to_phone,
                message_body=message,
                status=CommunicationStatus.SENT,
                job_id=job_id,
                external_message_id=external_message_id,
                sent_at=datetime.utcnow(),
                cost=0.0075  # Typical SMS cost
            )
            
            db.session.add(comm_log)
            db.session.commit()
            
            return {
                'success': True,
                'message_id': external_message_id,
                'communication_log_id': comm_log.id
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_email(self, to_email: str, subject: str, message: str, company_id: int,
                   job_id: Optional[int] = None, customer_id: Optional[int] = None) -> Dict:
        """Send email message"""
        try:
            # Get company notification settings
            settings = NotificationSettings.query.filter_by(company_id=company_id).first()
            
            if not settings or not settings.email_enabled:
                return {'success': False, 'error': 'Email not enabled for this company'}
            
            # In production, this would use SendGrid
            # from sendgrid.helpers.mail import Mail
            # message = Mail(
            #     from_email=settings.from_email,
            #     to_emails=to_email,
            #     subject=subject,
            #     html_content=message
            # )
            # response = self.sendgrid_client.send(message)
            
            # For demo purposes, simulate successful send
            external_message_id = f"demo_email_{datetime.utcnow().timestamp()}"
            
            # Log the communication
            comm_log = CommunicationLog(
                company_id=company_id,
                customer_id=customer_id,
                communication_type=CommunicationType.EMAIL,
                recipient_email=to_email,
                subject=subject,
                message_body=message,
                status=CommunicationStatus.SENT,
                job_id=job_id,
                external_message_id=external_message_id,
                sent_at=datetime.utcnow(),
                cost=0.0  # Email is typically free
            )
            
            db.session.add(comm_log)
            db.session.commit()
            
            return {
                'success': True,
                'message_id': external_message_id,
                'communication_log_id': comm_log.id
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_template_message(self, template_id: int, recipient_data: Dict, 
                            company_id: int, **kwargs) -> Dict:
        """Send message using a template"""
        try:
            template = MessageTemplate.query.get(template_id)
            if not template:
                return {'success': False, 'error': 'Template not found'}
            
            # Replace template variables
            message_body = self._replace_template_variables(
                template.message_body, recipient_data
            )
            subject = self._replace_template_variables(
                template.subject or '', recipient_data
            )
            
            # Send based on communication type
            if template.communication_type == CommunicationType.SMS:
                return self.send_sms(
                    to_phone=recipient_data.get('phone'),
                    message=message_body,
                    company_id=company_id,
                    **kwargs
                )
            elif template.communication_type == CommunicationType.EMAIL:
                return self.send_email(
                    to_email=recipient_data.get('email'),
                    subject=subject,
                    message=message_body,
                    company_id=company_id,
                    **kwargs
                )
            else:
                return {'success': False, 'error': 'Unsupported communication type'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _replace_template_variables(self, text: str, data: Dict) -> str:
        """Replace template variables with actual data"""
        if not text:
            return ''
        
        # Common template variables
        replacements = {
            '{{customer_name}}': data.get('customer_name', ''),
            '{{customer_first_name}}': data.get('customer_first_name', ''),
            '{{customer_last_name}}': data.get('customer_last_name', ''),
            '{{technician_name}}': data.get('technician_name', ''),
            '{{job_title}}': data.get('job_title', ''),
            '{{job_date}}': data.get('job_date', ''),
            '{{job_time}}': data.get('job_time', ''),
            '{{company_name}}': data.get('company_name', ''),
            '{{company_phone}}': data.get('company_phone', ''),
            '{{estimate_amount}}': data.get('estimate_amount', ''),
            '{{invoice_amount}}': data.get('invoice_amount', ''),
            '{{job_address}}': data.get('job_address', ''),
            '{{completion_time}}': data.get('completion_time', ''),
        }
        
        for variable, value in replacements.items():
            text = text.replace(variable, str(value))
        
        return text
    
    def send_appointment_reminder(self, job_id: int) -> Dict:
        """Send appointment reminder for a job"""
        try:
            from src.models.job import Job
            from src.models.customer import Customer
            from src.models.technician import Technician
            
            job = Job.query.get(job_id)
            if not job:
                return {'success': False, 'error': 'Job not found'}
            
            customer = Customer.query.get(job.customer_id)
            technician = Technician.query.get(job.technician_id)
            
            if not customer:
                return {'success': False, 'error': 'Customer not found'}
            
            # Prepare template data
            template_data = {
                'customer_name': f"{customer.first_name} {customer.last_name}",
                'customer_first_name': customer.first_name,
                'customer_last_name': customer.last_name,
                'technician_name': f"{technician.first_name} {technician.last_name}" if technician else 'Our technician',
                'job_title': job.title,
                'job_date': job.scheduled_date.strftime('%B %d, %Y') if job.scheduled_date else '',
                'job_time': job.scheduled_date.strftime('%I:%M %p') if job.scheduled_date else '',
                'job_address': f"{customer.address}, {customer.city}, {customer.state}",
                'phone': customer.phone,
                'email': customer.email
            }
            
            # Find appointment reminder template
            template = MessageTemplate.query.filter_by(
                company_id=job.company_id,
                category='appointment_reminder',
                is_active=True
            ).first()
            
            if template:
                return self.send_template_message(
                    template_id=template.id,
                    recipient_data=template_data,
                    company_id=job.company_id,
                    job_id=job_id,
                    customer_id=customer.id
                )
            else:
                # Send default reminder
                default_message = f"Hi {template_data['customer_first_name']}, this is a reminder that {template_data['technician_name']} will be arriving for your {template_data['job_title']} appointment on {template_data['job_date']} at {template_data['job_time']}. Please call if you need to reschedule."
                
                if customer.phone:
                    return self.send_sms(
                        to_phone=customer.phone,
                        message=default_message,
                        company_id=job.company_id,
                        job_id=job_id,
                        customer_id=customer.id
                    )
                elif customer.email:
                    return self.send_email(
                        to_email=customer.email,
                        subject="Appointment Reminder",
                        message=default_message,
                        company_id=job.company_id,
                        job_id=job_id,
                        customer_id=customer.id
                    )
                else:
                    return {'success': False, 'error': 'No contact information available'}
                    
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_job_completion_notification(self, job_id: int) -> Dict:
        """Send job completion notification"""
        try:
            from src.models.job import Job
            from src.models.customer import Customer
            from src.models.technician import Technician
            
            job = Job.query.get(job_id)
            if not job:
                return {'success': False, 'error': 'Job not found'}
            
            customer = Customer.query.get(job.customer_id)
            technician = Technician.query.get(job.technician_id)
            
            if not customer:
                return {'success': False, 'error': 'Customer not found'}
            
            # Prepare template data
            template_data = {
                'customer_name': f"{customer.first_name} {customer.last_name}",
                'customer_first_name': customer.first_name,
                'technician_name': f"{technician.first_name} {technician.last_name}" if technician else 'Our technician',
                'job_title': job.title,
                'completion_time': datetime.utcnow().strftime('%I:%M %p'),
                'phone': customer.phone,
                'email': customer.email
            }
            
            # Find completion template
            template = MessageTemplate.query.filter_by(
                company_id=job.company_id,
                category='job_completion',
                is_active=True
            ).first()
            
            if template:
                return self.send_template_message(
                    template_id=template.id,
                    recipient_data=template_data,
                    company_id=job.company_id,
                    job_id=job_id,
                    customer_id=customer.id
                )
            else:
                # Send default completion message
                default_message = f"Hi {template_data['customer_first_name']}, {template_data['technician_name']} has completed your {template_data['job_title']} service. Thank you for choosing us! Please let us know if you have any questions."
                
                if customer.phone:
                    return self.send_sms(
                        to_phone=customer.phone,
                        message=default_message,
                        company_id=job.company_id,
                        job_id=job_id,
                        customer_id=customer.id
                    )
                elif customer.email:
                    return self.send_email(
                        to_email=customer.email,
                        subject="Service Completed",
                        message=default_message,
                        company_id=job.company_id,
                        job_id=job_id,
                        customer_id=customer.id
                    )
                    
        except Exception as e:
            return {'success': False, 'error': str(e)}

# Global communication service instance
communication_service = CommunicationService()

