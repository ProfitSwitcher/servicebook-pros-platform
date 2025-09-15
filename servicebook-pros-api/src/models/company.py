from src.models.user import db
from datetime import datetime

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    website = db.Column(db.String(200))
    logo_url = db.Column(db.String(500))
    
    # Business settings
    business_type = db.Column(db.String(50), default='service')
    tax_id = db.Column(db.String(50))
    license_number = db.Column(db.String(100))
    
    # Subscription and billing
    subscription_plan = db.Column(db.String(50), default='basic')
    subscription_status = db.Column(db.String(20), default='active')
    billing_email = db.Column(db.String(120))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='company_ref', lazy=True)
    customers = db.relationship('Customer', backref='company_ref', lazy=True)
    jobs = db.relationship('Job', backref='company_ref', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'website': self.website,
            'logo_url': self.logo_url,
            'business_type': self.business_type,
            'tax_id': self.tax_id,
            'license_number': self.license_number,
            'subscription_plan': self.subscription_plan,
            'subscription_status': self.subscription_status,
            'billing_email': self.billing_email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CompanySettings(db.Model):
    __tablename__ = 'company_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Business hours
    business_hours_start = db.Column(db.String(10), default='08:00')
    business_hours_end = db.Column(db.String(10), default='17:00')
    business_days = db.Column(db.String(20), default='monday-friday')
    
    # Pricing settings
    default_labor_rate = db.Column(db.Float, default=75.0)
    default_markup_percentage = db.Column(db.Float, default=20.0)
    tax_rate = db.Column(db.Float, default=8.5)
    
    # Invoice settings
    invoice_prefix = db.Column(db.String(10), default='INV')
    invoice_counter = db.Column(db.Integer, default=1)
    payment_terms = db.Column(db.String(50), default='Net 30')
    
    # Estimate settings
    estimate_prefix = db.Column(db.String(10), default='EST')
    estimate_counter = db.Column(db.Integer, default=1)
    estimate_validity_days = db.Column(db.Integer, default=30)
    
    # Notification settings
    email_notifications = db.Column(db.Boolean, default=True)
    sms_notifications = db.Column(db.Boolean, default=False)
    
    # Integration settings
    google_calendar_enabled = db.Column(db.Boolean, default=False)
    quickbooks_enabled = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = db.relationship('Company', backref='settings')
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'business_hours_start': self.business_hours_start,
            'business_hours_end': self.business_hours_end,
            'business_days': self.business_days,
            'default_labor_rate': self.default_labor_rate,
            'default_markup_percentage': self.default_markup_percentage,
            'tax_rate': self.tax_rate,
            'invoice_prefix': self.invoice_prefix,
            'invoice_counter': self.invoice_counter,
            'payment_terms': self.payment_terms,
            'estimate_prefix': self.estimate_prefix,
            'estimate_counter': self.estimate_counter,
            'estimate_validity_days': self.estimate_validity_days,
            'email_notifications': self.email_notifications,
            'sms_notifications': self.sms_notifications,
            'google_calendar_enabled': self.google_calendar_enabled,
            'quickbooks_enabled': self.quickbooks_enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

