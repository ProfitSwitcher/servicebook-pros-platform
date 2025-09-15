from src.models.user import db
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

class CommunicationConfig(db.Model):
    __tablename__ = 'communication_configs'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    
    # Twilio Configuration
    twilio_account_sid = Column(String(100), nullable=True)
    twilio_auth_token = Column(String(100), nullable=True)
    twilio_phone_number = Column(String(20), nullable=True)
    twilio_webhook_url = Column(String(255), nullable=True)
    
    # SendGrid Configuration
    sendgrid_api_key = Column(String(200), nullable=True)
    sendgrid_from_email = Column(String(255), nullable=True)
    sendgrid_from_name = Column(String(100), nullable=True)
    sendgrid_webhook_url = Column(String(255), nullable=True)
    
    # Email Domain Configuration
    custom_domain = Column(String(100), nullable=True)  # e.g., "mybusiness.com"
    domain_verified = Column(Boolean, default=False)
    spf_record = Column(Text, nullable=True)
    dkim_record = Column(Text, nullable=True)
    
    # Communication Settings
    auto_reply_enabled = Column(Boolean, default=False)
    auto_reply_message = Column(Text, nullable=True)
    business_hours_only = Column(Boolean, default=False)
    business_hours_start = Column(String(10), default='08:00')
    business_hours_end = Column(String(10), default='17:00')
    
    # Template Settings
    appointment_reminder_template = Column(Text, nullable=True)
    estimate_ready_template = Column(Text, nullable=True)
    job_completion_template = Column(Text, nullable=True)
    payment_reminder_template = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", backref="communication_config")
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'twilio_account_sid': self.twilio_account_sid,
            'twilio_phone_number': self.twilio_phone_number,
            'sendgrid_from_email': self.sendgrid_from_email,
            'sendgrid_from_name': self.sendgrid_from_name,
            'custom_domain': self.custom_domain,
            'domain_verified': self.domain_verified,
            'auto_reply_enabled': self.auto_reply_enabled,
            'auto_reply_message': self.auto_reply_message,
            'business_hours_only': self.business_hours_only,
            'business_hours_start': self.business_hours_start,
            'business_hours_end': self.business_hours_end,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class PhoneNumberPool(db.Model):
    __tablename__ = 'phone_number_pool'
    
    id = Column(Integer, primary_key=True)
    phone_number = Column(String(20), unique=True, nullable=False)
    twilio_sid = Column(String(100), nullable=True)
    country_code = Column(String(5), default='US')
    area_code = Column(String(10), nullable=True)
    is_available = Column(Boolean, default=True)
    monthly_cost = Column(String(10), default='1.00')  # USD
    capabilities = Column(String(50), default='SMS,Voice')  # SMS, Voice, MMS
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'phone_number': self.phone_number,
            'country_code': self.country_code,
            'area_code': self.area_code,
            'is_available': self.is_available,
            'monthly_cost': self.monthly_cost,
            'capabilities': self.capabilities.split(',') if self.capabilities else [],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class EmailDomain(db.Model):
    __tablename__ = 'email_domains'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    domain_name = Column(String(100), nullable=False)
    
    # Verification Status
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(100), nullable=True)
    
    # DNS Records
    spf_record = Column(Text, nullable=True)
    dkim_record = Column(Text, nullable=True)
    dmarc_record = Column(Text, nullable=True)
    mx_record = Column(Text, nullable=True)
    
    # SendGrid Integration
    sendgrid_domain_id = Column(String(50), nullable=True)
    sendgrid_status = Column(String(20), default='pending')  # pending, verified, failed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", backref="email_domains")
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'domain_name': self.domain_name,
            'is_verified': self.is_verified,
            'spf_record': self.spf_record,
            'dkim_record': self.dkim_record,
            'dmarc_record': self.dmarc_record,
            'sendgrid_status': self.sendgrid_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

