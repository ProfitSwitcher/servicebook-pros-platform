from src.models.user import db
from datetime import datetime, timedelta
import enum

class InvoiceStatus(enum.Enum):
    DRAFT = 'draft'
    SENT = 'sent'
    VIEWED = 'viewed'
    PAID = 'paid'
    PARTIAL = 'partial'
    OVERDUE = 'overdue'
    CANCELLED = 'cancelled'

class PaymentMethod(enum.Enum):
    CASH = 'cash'
    CHECK = 'check'
    CREDIT_CARD = 'credit_card'
    BANK_TRANSFER = 'bank_transfer'
    OTHER = 'other'

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'))
    estimate_id = db.Column(db.Integer, db.ForeignKey('estimates.id'))
    
    # Invoice identification
    invoice_number = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    # Status and dates
    status = db.Column(db.Enum(InvoiceStatus), default=InvoiceStatus.DRAFT)
    invoice_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    
    # Financial details
    subtotal = db.Column(db.Float, default=0.0)
    tax_rate = db.Column(db.Float, default=8.5)
    tax_amount = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, default=0.0)
    paid_amount = db.Column(db.Float, default=0.0)
    balance_due = db.Column(db.Float, default=0.0)
    
    # Terms and conditions
    payment_terms = db.Column(db.String(50), default='Net 30')
    terms_conditions = db.Column(db.Text)
    notes = db.Column(db.Text)
    
    # Tracking
    sent_at = db.Column(db.DateTime)
    viewed_at = db.Column(db.DateTime)
    paid_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    line_items = db.relationship('InvoiceLineItem', backref='invoice', lazy=True, cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='invoice', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'customer_id': self.customer_id,
            'job_id': self.job_id,
            'estimate_id': self.estimate_id,
            'invoice_number': self.invoice_number,
            'title': self.title,
            'description': self.description,
            'status': self.status.value if self.status else None,
            'invoice_date': self.invoice_date.isoformat() if self.invoice_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'subtotal': self.subtotal,
            'tax_rate': self.tax_rate,
            'tax_amount': self.tax_amount,
            'discount_amount': self.discount_amount,
            'total_amount': self.total_amount,
            'paid_amount': self.paid_amount,
            'balance_due': self.balance_due,
            'payment_terms': self.payment_terms,
            'terms_conditions': self.terms_conditions,
            'notes': self.notes,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'viewed_at': self.viewed_at.isoformat() if self.viewed_at else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'line_items': [item.to_dict() for item in self.line_items],
            'payments': [payment.to_dict() for payment in self.payments]
        }
    
    def calculate_totals(self):
        """Calculate invoice totals based on line items"""
        self.subtotal = sum(item.total_price for item in self.line_items)
        self.tax_amount = self.subtotal * (self.tax_rate / 100)
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        self.balance_due = self.total_amount - self.paid_amount
        
        # Update status based on payment
        if self.paid_amount >= self.total_amount:
            self.status = InvoiceStatus.PAID
            if not self.paid_at:
                self.paid_at = datetime.utcnow()
        elif self.paid_amount > 0:
            self.status = InvoiceStatus.PARTIAL
        elif self.due_date and datetime.utcnow() > self.due_date and self.status == InvoiceStatus.SENT:
            self.status = InvoiceStatus.OVERDUE
    
    @property
    def is_overdue(self):
        return (self.due_date and 
                datetime.utcnow() > self.due_date and 
                self.balance_due > 0)
    
    @property
    def days_overdue(self):
        if self.is_overdue:
            return (datetime.utcnow() - self.due_date).days
        return 0

class InvoiceLineItem(db.Model):
    __tablename__ = 'invoice_line_items'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    
    # Item details
    item_type = db.Column(db.String(20), default='service')  # service, material, labor
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    
    # Pricing
    quantity = db.Column(db.Float, default=1.0)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    
    # Labor details (if applicable)
    labor_hours = db.Column(db.Float)
    labor_rate = db.Column(db.Float)
    
    # Material details (if applicable)
    material_cost = db.Column(db.Float)
    markup_percentage = db.Column(db.Float, default=20.0)
    
    # Flat rate pricing
    flat_rate_code = db.Column(db.String(50))
    is_flat_rate = db.Column(db.Boolean, default=False)
    
    # Order
    sort_order = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'item_type': self.item_type,
            'description': self.description,
            'category': self.category,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'total_price': self.total_price,
            'labor_hours': self.labor_hours,
            'labor_rate': self.labor_rate,
            'material_cost': self.material_cost,
            'markup_percentage': self.markup_percentage,
            'flat_rate_code': self.flat_rate_code,
            'is_flat_rate': self.is_flat_rate,
            'sort_order': self.sort_order
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Payment details
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.Enum(PaymentMethod), default=PaymentMethod.CASH)
    
    # Reference information
    reference_number = db.Column(db.String(100))
    check_number = db.Column(db.String(50))
    transaction_id = db.Column(db.String(100))
    
    # Notes
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'company_id': self.company_id,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'amount': self.amount,
            'payment_method': self.payment_method.value if self.payment_method else None,
            'reference_number': self.reference_number,
            'check_number': self.check_number,
            'transaction_id': self.transaction_id,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

