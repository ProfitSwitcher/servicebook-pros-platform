from src.models.user import db
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = Column(Integer, primary_key=True)
    company_name = Column(String(255), nullable=False)
    company_code = Column(String(50), unique=True, nullable=False)  # Unique identifier
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(50))
    zip_code = Column(String(20))
    
    # Subscription info
    subscription_plan = Column(String(50), default='basic')  # basic, pro, enterprise
    subscription_status = Column(String(20), default='active')  # active, suspended, cancelled
    trial_end_date = Column(DateTime)
    
    # Settings
    default_labor_rate = Column(Numeric(10, 2), default=150.00)  # Default $150/hour
    default_tax_rate = Column(Numeric(5, 4), default=0.0875)  # Default 8.75%
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'company_code': self.company_code,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'subscription_plan': self.subscription_plan,
            'subscription_status': self.subscription_status,
            'trial_end_date': self.trial_end_date.isoformat() if self.trial_end_date else None,
            'default_labor_rate': float(self.default_labor_rate) if self.default_labor_rate else None,
            'default_tax_rate': float(self.default_tax_rate) if self.default_tax_rate else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }

class CompanyUser(db.Model):
    __tablename__ = 'company_users'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, db.ForeignKey('users.id'), nullable=False)
    company_id = Column(Integer, db.ForeignKey('companies.id'), nullable=False)
    role = Column(String(50), default='user')  # admin, manager, user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='company_associations')
    company = db.relationship('Company', backref='user_associations')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'company_id': self.company_id,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': self.user.to_dict() if self.user else None,
            'company': self.company.to_dict() if self.company else None
        }

