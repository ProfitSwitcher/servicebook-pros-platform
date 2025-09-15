"""
Communication models for ServiceBook Pros
Handles SMS, Email, and notification systems
"""

from src.models.user import db
from datetime import datetime
import enum
import json

class CommunicationType(enum.Enum):
    SMS = 'sms'
    EMAIL = 'email'
    PUSH_NOTIFICATION = 'push_notification'
    IN_APP = 'in_app'
    PHONE_CALL = 'phone_call'

class CommunicationStatus(enum.Enum):
    PENDING = 'pending'
    SENT = 'sent'
    DELIVERED = 'delivered'
    READ = 'read'
    FAILED = 'failed'
    CANCELLED = 'cancelled'

class CommunicationPriority(enum.Enum):
    LOW = 'low'
    NORMAL = 'normal'
    HIGH = 'high'
    URGENT = 'urgent'

class MessageTemplate(db.Model):
    __tablename__ = 'message_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Template details
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))  # appointment_reminder, job_update, etc.
    communication_type = db.Column(db.Enum(CommunicationType), nullable=False)
    
    # Content
    subject = db.Column(db.String(500))  # For emails
    message_body = db.Column(db.Text, nullable=False)
    
    # Template variables (JSON)
    available_variables = db.Column(db.Text)  # JSON list of available variables
    
    # Settings
    is_active = db.Column(db.Boolean, default=True)
    is_system_template = db.Column(db.Boolean, default=False)
    
    # Timing
    send_timing = db.Column(db.String(100))  # immediate, 1_hour_before, 24_hours_before, etc.
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'communication_type': self.communication_type.value if self.communication_type else None,
            'subject': self.subject,
            'message_body': self.message_body,
            'available_variables': json.loads(self.available_variables) if self.available_variables else [],
            'is_active': self.is_active,
            'is_system_template': self.is_system_template,
            'send_timing': self.send_timing,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CommunicationLog(db.Model):
    __tablename__ = 'communication_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Recipients
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))
    technician_id = db.Column(db.Integer, db.ForeignKey('technicians.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Communication details
    communication_type = db.Column(db.Enum(CommunicationType), nullable=False)
    recipient_phone = db.Column(db.String(20))
    recipient_email = db.Column(db.String(200))
    recipient_name = db.Column(db.String(200))
    
    # Content
    subject = db.Column(db.String(500))
    message_body = db.Column(db.Text, nullable=False)
    
    # Status and tracking
    status = db.Column(db.Enum(CommunicationStatus), default=CommunicationStatus.PENDING)
    priority = db.Column(db.Enum(CommunicationPriority), default=CommunicationPriority.NORMAL)
    
    # Reference information
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'))
    estimate_id = db.Column(db.Integer, db.ForeignKey('estimates.id'))
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'))
    template_id = db.Column(db.Integer, db.ForeignKey('message_templates.id'))
    
    # External service tracking
    external_message_id = db.Column(db.String(200))  # Twilio/SendGrid message ID
    external_status = db.Column(db.String(100))
    external_error_message = db.Column(db.Text)
    
    # Timing
    scheduled_send_time = db.Column(db.DateTime)
    sent_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    read_at = db.Column(db.DateTime)
    
    # Metadata
    sent_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    cost = db.Column(db.Float)  # Cost of sending (for SMS)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'customer_id': self.customer_id,
            'technician_id': self.technician_id,
            'user_id': self.user_id,
            'communication_type': self.communication_type.value if self.communication_type else None,
            'recipient_phone': self.recipient_phone,
            'recipient_email': self.recipient_email,
            'recipient_name': self.recipient_name,
            'subject': self.subject,
            'message_body': self.message_body,
            'status': self.status.value if self.status else None,
            'priority': self.priority.value if self.priority else None,
            'job_id': self.job_id,
            'estimate_id': self.estimate_id,
            'invoice_id': self.invoice_id,
            'template_id': self.template_id,
            'external_message_id': self.external_message_id,
            'external_status': self.external_status,
            'external_error_message': self.external_error_message,
            'scheduled_send_time': self.scheduled_send_time.isoformat() if self.scheduled_send_time else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'sent_by_user_id': self.sent_by_user_id,
            'cost': self.cost,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CustomerQuestion(db.Model):
    __tablename__ = 'customer_questions'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Question details
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(100))  # general, urgent, technical, pricing, etc.
    category = db.Column(db.String(100))
    
    # Priority and status
    is_urgent = db.Column(db.Boolean, default=False)
    priority = db.Column(db.Enum(CommunicationPriority), default=CommunicationPriority.NORMAL)
    status = db.Column(db.String(50), default='pending')  # pending, sent, answered, resolved
    
    # Response
    answer_text = db.Column(db.Text)
    answered_by_customer = db.Column(db.Boolean, default=False)
    answered_at = db.Column(db.DateTime)
    
    # Communication tracking
    communication_log_id = db.Column(db.Integer, db.ForeignKey('communication_logs.id'))
    
    # Metadata
    asked_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    technician_id = db.Column(db.Integer, db.ForeignKey('technicians.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'job_id': self.job_id,
            'customer_id': self.customer_id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'category': self.category,
            'is_urgent': self.is_urgent,
            'priority': self.priority.value if self.priority else None,
            'status': self.status,
            'answer_text': self.answer_text,
            'answered_by_customer': self.answered_by_customer,
            'answered_at': self.answered_at.isoformat() if self.answered_at else None,
            'communication_log_id': self.communication_log_id,
            'asked_by_user_id': self.asked_by_user_id,
            'technician_id': self.technician_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class NotificationSettings(db.Model):
    __tablename__ = 'notification_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # SMS Settings
    sms_enabled = db.Column(db.Boolean, default=True)
    twilio_account_sid = db.Column(db.String(200))
    twilio_auth_token = db.Column(db.String(200))
    twilio_phone_number = db.Column(db.String(20))
    
    # Email Settings
    email_enabled = db.Column(db.Boolean, default=True)
    sendgrid_api_key = db.Column(db.String(200))
    from_email = db.Column(db.String(200))
    from_name = db.Column(db.String(200))
    
    # Notification preferences
    send_appointment_reminders = db.Column(db.Boolean, default=True)
    send_job_updates = db.Column(db.Boolean, default=True)
    send_completion_notifications = db.Column(db.Boolean, default=True)
    send_invoice_notifications = db.Column(db.Boolean, default=True)
    
    # Timing preferences
    reminder_hours_before = db.Column(db.Integer, default=24)
    business_hours_start = db.Column(db.Time)
    business_hours_end = db.Column(db.Time)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'sms_enabled': self.sms_enabled,
            'twilio_account_sid': self.twilio_account_sid,
            'twilio_phone_number': self.twilio_phone_number,
            'email_enabled': self.email_enabled,
            'from_email': self.from_email,
            'from_name': self.from_name,
            'send_appointment_reminders': self.send_appointment_reminders,
            'send_job_updates': self.send_job_updates,
            'send_completion_notifications': self.send_completion_notifications,
            'send_invoice_notifications': self.send_invoice_notifications,
            'reminder_hours_before': self.reminder_hours_before,
            'business_hours_start': self.business_hours_start.isoformat() if self.business_hours_start else None,
            'business_hours_end': self.business_hours_end.isoformat() if self.business_hours_end else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class AutomatedMessage(db.Model):
    __tablename__ = 'automated_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Trigger settings
    trigger_event = db.Column(db.String(100), nullable=False)  # job_scheduled, job_completed, etc.
    trigger_conditions = db.Column(db.Text)  # JSON conditions
    
    # Message settings
    template_id = db.Column(db.Integer, db.ForeignKey('message_templates.id'), nullable=False)
    delay_minutes = db.Column(db.Integer, default=0)  # Delay before sending
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'trigger_event': self.trigger_event,
            'trigger_conditions': json.loads(self.trigger_conditions) if self.trigger_conditions else {},
            'template_id': self.template_id,
            'delay_minutes': self.delay_minutes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

