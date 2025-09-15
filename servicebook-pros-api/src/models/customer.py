from src.models.user import db
from datetime import datetime

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Basic information
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    mobile = db.Column(db.String(20))
    
    # Address information
    address = db.Column(db.Text)
    city = db.Column(db.String(50))
    state = db.Column(db.String(20))
    zip_code = db.Column(db.String(10))
    country = db.Column(db.String(50), default='USA')
    
    # Business information
    company_name = db.Column(db.String(100))
    customer_type = db.Column(db.String(20), default='residential')  # residential, commercial
    status = db.Column(db.String(20), default='active')  # active, inactive, prospect
    
    # Preferences and notes
    preferred_contact_method = db.Column(db.String(20), default='phone')  # phone, email, text
    notes = db.Column(db.Text)
    tags = db.Column(db.String(500))  # Comma-separated tags
    
    # Financial information
    credit_limit = db.Column(db.Float, default=0.0)
    payment_terms = db.Column(db.String(50), default='Net 30')
    tax_exempt = db.Column(db.Boolean, default=False)
    
    # Service area and routing
    service_area = db.Column(db.String(100))
    route_priority = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_service_date = db.Column(db.DateTime)
    
    # Relationships
    jobs = db.relationship('Job', backref='customer', lazy=True)
    estimates = db.relationship('Estimate', backref='customer', lazy=True)
    invoices = db.relationship('Invoice', backref='customer', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'display_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'mobile': self.mobile,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'country': self.country,
            'company_name': self.company_name,
            'customer_type': self.customer_type,
            'status': self.status,
            'preferred_contact_method': self.preferred_contact_method,
            'notes': self.notes,
            'tags': self.tags.split(',') if self.tags else [],
            'credit_limit': self.credit_limit,
            'payment_terms': self.payment_terms,
            'tax_exempt': self.tax_exempt,
            'service_area': self.service_area,
            'route_priority': self.route_priority,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_service_date': self.last_service_date.isoformat() if self.last_service_date else None
        }
    
    @property
    def full_address(self):
        parts = [self.address, self.city, self.state, self.zip_code]
        return ', '.join([part for part in parts if part])
    
    @property
    def display_name(self):
        return f"{self.first_name} {self.last_name}"

class CustomerContact(db.Model):
    __tablename__ = 'customer_contacts'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Contact information
    name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(50))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    mobile = db.Column(db.String(20))
    
    # Contact preferences
    is_primary = db.Column(db.Boolean, default=False)
    can_authorize_work = db.Column(db.Boolean, default=False)
    preferred_contact_method = db.Column(db.String(20), default='phone')
    
    # Notes
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    customer = db.relationship('Customer', backref='contacts')
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'name': self.name,
            'title': self.title,
            'email': self.email,
            'phone': self.phone,
            'mobile': self.mobile,
            'is_primary': self.is_primary,
            'can_authorize_work': self.can_authorize_work,
            'preferred_contact_method': self.preferred_contact_method,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CustomerHistory(db.Model):
    __tablename__ = 'customer_history'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # History details
    action_type = db.Column(db.String(50), nullable=False)  # created, updated, contacted, etc.
    description = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text)  # JSON string for additional details
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    customer = db.relationship('Customer', backref='history')
    user = db.relationship('User', backref='customer_actions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'customer_id': self.customer_id,
            'user_id': self.user_id,
            'action_type': self.action_type,
            'description': self.description,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

