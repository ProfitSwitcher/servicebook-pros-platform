from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    customer_id = Column(Integer, nullable=True)  # Can be null for new customers
    customer_name = Column(String(255), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    customer_email = Column(String(255), nullable=True)
    
    # Message details
    message_type = Column(String(10), nullable=False)  # 'sms' or 'email'
    direction = Column(String(10), nullable=False)  # 'inbound' or 'outbound'
    subject = Column(String(255), nullable=True)  # For emails
    content = Column(Text, nullable=False)
    
    # External service IDs
    twilio_sid = Column(String(100), nullable=True)  # Twilio message SID
    sendgrid_message_id = Column(String(100), nullable=True)  # SendGrid message ID
    
    # Status and metadata
    status = Column(String(20), default='sent')  # sent, delivered, failed, read
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="messages")
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'customer_id': self.customer_id,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'message_type': self.message_type,
            'direction': self.direction,
            'subject': self.subject,
            'content': self.content,
            'twilio_sid': self.twilio_sid,
            'sendgrid_message_id': self.sendgrid_message_id,
            'status': self.status,
            'read': self.read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Customer(Base):
    __tablename__ = 'customers'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(50), nullable=True)
    zip_code = Column(String(10), nullable=True)
    
    # Communication preferences
    preferred_contact = Column(String(10), default='phone')  # phone, email, sms
    opt_out_sms = Column(Boolean, default=False)
    opt_out_email = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="customers")
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'preferred_contact': self.preferred_contact,
            'opt_out_sms': self.opt_out_sms,
            'opt_out_email': self.opt_out_email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

