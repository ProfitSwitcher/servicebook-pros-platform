from src.models.user import db
from datetime import datetime, timedelta
import enum

class EstimateStatus(enum.Enum):
    DRAFT = 'draft'
    SENT = 'sent'
    VIEWED = 'viewed'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    EXPIRED = 'expired'
    CONVERTED = 'converted'

class Estimate(db.Model):
    __tablename__ = 'estimates'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Estimate identification
    estimate_number = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    # Status and validity
    status = db.Column(db.Enum(EstimateStatus), default=EstimateStatus.DRAFT)
    valid_until = db.Column(db.DateTime)
    
    # Financial details
    subtotal = db.Column(db.Float, default=0.0)
    tax_rate = db.Column(db.Float, default=8.5)
    tax_amount = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, default=0.0)
    
    # Terms and conditions
    terms_conditions = db.Column(db.Text)
    notes = db.Column(db.Text)
    
    # Tracking
    sent_at = db.Column(db.DateTime)
    viewed_at = db.Column(db.DateTime)
    approved_at = db.Column(db.DateTime)
    rejected_at = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    line_items = db.relationship('EstimateLineItem', backref='estimate', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'customer_id': self.customer_id,
            'estimate_number': self.estimate_number,
            'title': self.title,
            'description': self.description,
            'status': self.status.value if self.status else None,
            'valid_until': self.valid_until.isoformat() if self.valid_until else None,
            'subtotal': self.subtotal,
            'tax_rate': self.tax_rate,
            'tax_amount': self.tax_amount,
            'discount_amount': self.discount_amount,
            'total_amount': self.total_amount,
            'terms_conditions': self.terms_conditions,
            'notes': self.notes,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'viewed_at': self.viewed_at.isoformat() if self.viewed_at else None,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'rejected_at': self.rejected_at.isoformat() if self.rejected_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'line_items': [item.to_dict() for item in self.line_items]
        }
    
    def calculate_totals(self):
        """Calculate estimate totals based on line items"""
        self.subtotal = sum(item.total_price for item in self.line_items)
        self.tax_amount = self.subtotal * (self.tax_rate / 100)
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
    
    @property
    def is_expired(self):
        return self.valid_until and datetime.utcnow() > self.valid_until

class EstimateLineItem(db.Model):
    __tablename__ = 'estimate_line_items'
    
    id = db.Column(db.Integer, primary_key=True)
    estimate_id = db.Column(db.Integer, db.ForeignKey('estimates.id'), nullable=False)
    
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
            'estimate_id': self.estimate_id,
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
    
    def calculate_total(self):
        """Calculate total price for this line item"""
        if self.is_flat_rate:
            # Flat rate pricing
            self.total_price = self.unit_price * self.quantity
        else:
            # Calculate based on labor + materials
            labor_cost = (self.labor_hours or 0) * (self.labor_rate or 0)
            material_cost_with_markup = (self.material_cost or 0) * (1 + (self.markup_percentage or 0) / 100)
            self.total_price = (labor_cost + material_cost_with_markup) * self.quantity

