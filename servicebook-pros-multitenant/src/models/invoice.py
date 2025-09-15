from src.models.user import db
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric, Date, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship

class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(50))
    zip_code = Column(String(20))
    
    # Customer preferences
    preferred_payment_terms = Column(String(50), default='Net 30')
    tax_exempt = Column(Boolean, default=False)
    discount_rate = Column(Numeric(5, 4), default=0.0000)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    company = relationship('Company', backref='customers')
    invoices = relationship('Invoice', back_populates='customer')
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'preferred_payment_terms': self.preferred_payment_terms,
            'tax_exempt': self.tax_exempt,
            'discount_rate': float(self.discount_rate) if self.discount_rate else 0.0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }

class WorkOrder(db.Model):
    __tablename__ = 'work_orders'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    work_order_number = Column(String(50), nullable=False)
    description = Column(Text)
    status = Column(String(20), default='pending')  # pending, in_progress, completed, cancelled
    scheduled_date = Column(Date)
    completion_date = Column(Date)
    estimated_hours = Column(Numeric(5, 2))
    actual_hours = Column(Numeric(5, 2))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship('Company', backref='work_orders')
    customer = relationship('Customer', backref='work_orders')
    invoices = relationship('Invoice', back_populates='work_order')
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'customer_id': self.customer_id,
            'work_order_number': self.work_order_number,
            'description': self.description,
            'status': self.status,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None,
            'estimated_hours': float(self.estimated_hours) if self.estimated_hours else None,
            'actual_hours': float(self.actual_hours) if self.actual_hours else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    work_order_id = Column(Integer, ForeignKey('work_orders.id'), nullable=True)
    
    # Invoice details
    invoice_number = Column(String(50), nullable=False)
    date_issued = Column(Date, default=date.today)
    due_date = Column(Date, nullable=False)
    status = Column(String(20), default='draft')  # draft, sent, paid, overdue, cancelled
    
    # Financial details
    subtotal = Column(Numeric(10, 2), default=0.00)
    tax_rate = Column(Numeric(5, 4), default=0.0875)  # Default 8.75%
    tax_amount = Column(Numeric(10, 2), default=0.00)
    total_amount = Column(Numeric(10, 2), default=0.00)
    
    # Terms and notes
    payment_terms = Column(String(50), default='Net 30')
    notes = Column(Text)
    terms_conditions = Column(Text)
    
    # Timestamps and audit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('users.id'))
    updated_by = Column(Integer, ForeignKey('users.id'))
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')", name='check_invoice_status'),
    )
    
    # Relationships
    company = relationship('Company', backref='invoices')
    customer = relationship('Customer', back_populates='invoices')
    work_order = relationship('WorkOrder', back_populates='invoices')
    line_items = relationship('InvoiceLineItem', back_populates='invoice', cascade='all, delete-orphan')
    payments = relationship('Payment', back_populates='invoice', cascade='all, delete-orphan')
    creator = relationship('User', foreign_keys=[created_by])
    updater = relationship('User', foreign_keys=[updated_by])
    
    @property
    def amount_paid(self):
        return sum(payment.amount for payment in self.payments)
    
    @property
    def amount_due(self):
        return self.total_amount - self.amount_paid
    
    @property
    def is_overdue(self):
        return self.due_date < date.today() and self.status not in ['paid', 'cancelled']
    
    def calculate_totals(self):
        """Calculate and update invoice totals based on line items"""
        self.subtotal = sum(item.total_price for item in self.line_items)
        self.tax_amount = self.subtotal * self.tax_rate
        self.total_amount = self.subtotal + self.tax_amount
        self.updated_at = datetime.utcnow()
    
    def to_dict(self, include_details=False):
        result = {
            'id': self.id,
            'company_id': self.company_id,
            'customer_id': self.customer_id,
            'work_order_id': self.work_order_id,
            'invoice_number': self.invoice_number,
            'date_issued': self.date_issued.isoformat() if self.date_issued else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'status': self.status,
            'subtotal': float(self.subtotal) if self.subtotal else 0.0,
            'tax_rate': float(self.tax_rate) if self.tax_rate else 0.0,
            'tax_amount': float(self.tax_amount) if self.tax_amount else 0.0,
            'total_amount': float(self.total_amount) if self.total_amount else 0.0,
            'amount_paid': float(self.amount_paid),
            'amount_due': float(self.amount_due),
            'is_overdue': self.is_overdue,
            'payment_terms': self.payment_terms,
            'notes': self.notes,
            'terms_conditions': self.terms_conditions,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'created_by': self.created_by,
            'updated_by': self.updated_by
        }
        
        if include_details:
            result.update({
                'customer': self.customer.to_dict() if self.customer else None,
                'work_order': self.work_order.to_dict() if self.work_order else None,
                'line_items': [item.to_dict() for item in self.line_items],
                'payments': [payment.to_dict() for payment in self.payments]
            })
        
        return result

class InvoiceLineItem(db.Model):
    __tablename__ = 'invoice_line_items'
    
    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=False)
    service_id = Column(Integer, ForeignKey('master_services.id'), nullable=True)
    material_id = Column(Integer, ForeignKey('master_materials.id'), nullable=True)
    
    # Line item details
    line_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    quantity = Column(Numeric(10, 3), default=1.000)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    item_type = Column(String(20), nullable=False)  # service, material, labor, other
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Constraints
    __table_args__ = (
        CheckConstraint("item_type IN ('service', 'material', 'labor', 'other')", name='check_line_item_type'),
    )
    
    # Relationships
    invoice = relationship('Invoice', back_populates='line_items')
    
    def calculate_total(self):
        """Calculate and update total price based on quantity and unit price"""
        self.total_price = self.quantity * self.unit_price
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'service_id': self.service_id,
            'material_id': self.material_id,
            'line_number': self.line_number,
            'description': self.description,
            'quantity': float(self.quantity) if self.quantity else 0.0,
            'unit_price': float(self.unit_price) if self.unit_price else 0.0,
            'total_price': float(self.total_price) if self.total_price else 0.0,
            'item_type': self.item_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=False)
    
    # Payment details
    amount = Column(Numeric(10, 2), nullable=False)
    payment_date = Column(Date, default=date.today)
    payment_method = Column(String(50), nullable=False)  # cash, check, credit_card, online, etc.
    reference_number = Column(String(100))
    notes = Column(Text)
    
    # Timestamps and audit
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('users.id'))
    
    # Relationships
    invoice = relationship('Invoice', back_populates='payments')
    creator = relationship('User')
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'amount': float(self.amount) if self.amount else 0.0,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'reference_number': self.reference_number,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'created_by': self.created_by
        }

class InvoiceTemplate(db.Model):
    __tablename__ = 'invoice_templates'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    
    # Template details
    name = Column(String(100), nullable=False)
    is_default = Column(Boolean, default=False)
    header_logo_url = Column(String(500))
    header_text = Column(Text)
    footer_text = Column(Text)
    terms_conditions = Column(Text)
    
    # Styling
    color_scheme = Column(Text)  # JSON string for color configuration
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship('Company', backref='invoice_templates')
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'name': self.name,
            'is_default': self.is_default,
            'header_logo_url': self.header_logo_url,
            'header_text': self.header_text,
            'footer_text': self.footer_text,
            'terms_conditions': self.terms_conditions,
            'color_scheme': self.color_scheme,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

