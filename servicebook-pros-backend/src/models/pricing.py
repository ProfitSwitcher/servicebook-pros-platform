from src.models.user import db
from sqlalchemy import Numeric
from datetime import datetime

class ElectricalService(db.Model):
    """
    Model for electrical services using the EL-XX-XXX coding system
    Stores the 4,153 electrical services from the flat rate pricing files
    """
    __tablename__ = 'electrical_services'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # ServiceBook Pros EL-XX-XXX coding system
    service_code = db.Column(db.String(10), unique=True, nullable=False, index=True)  # e.g., EL-01-001
    category_code = db.Column(db.String(5), nullable=False, index=True)  # e.g., EL-01
    category_name = db.Column(db.String(100), nullable=False)  # e.g., "Troubleshooting & Code Repair"
    subcategory_code = db.Column(db.String(20), nullable=True, index=True)  # e.g., EL-01-A
    subcategory_name = db.Column(db.String(100), nullable=True)  # e.g., "Safety Inspections"
    
    # Service details
    service_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Pricing information
    base_price = db.Column(Numeric(10, 2), nullable=False)
    labor_hours = db.Column(Numeric(5, 2), nullable=False)
    material_cost = db.Column(Numeric(10, 2), default=0.00)
    
    # Original TRO/SER codes for reference
    original_code = db.Column(db.String(20), nullable=True)  # Original TRO001, SER001, etc.
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<ElectricalService {self.service_code}: {self.service_name}>'
    
    def to_dict(self):
        """Convert service to dictionary for API responses"""
        return {
            'id': self.id,
            'service_code': self.service_code,
            'category_code': self.category_code,
            'category_name': self.category_name,
            'subcategory_code': self.subcategory_code,
            'subcategory_name': self.subcategory_name,
            'service_name': self.service_name,
            'description': self.description,
            'base_price': float(self.base_price),
            'labor_hours': float(self.labor_hours),
            'material_cost': float(self.material_cost),
            'original_code': self.original_code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }

class PricingSettings(db.Model):
    """
    Model for pricing settings including labor rate adjustments
    Allows contractors to adjust labor rates dynamically
    """
    __tablename__ = 'pricing_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    contractor_id = db.Column(db.String(50), nullable=False, index=True)  # Contractor identifier
    
    # Labor rate settings
    base_labor_rate = db.Column(Numeric(8, 2), nullable=False, default=75.00)  # $/hour
    markup_percentage = db.Column(Numeric(5, 2), nullable=False, default=15.00)  # %
    
    # Regional adjustments
    region = db.Column(db.String(100), nullable=True)
    cost_of_living_multiplier = db.Column(Numeric(4, 2), default=1.00)
    
    # Business settings
    business_name = db.Column(db.String(200), nullable=True)
    license_number = db.Column(db.String(50), nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<PricingSettings {self.contractor_id}: ${self.base_labor_rate}/hr>'
    
    def to_dict(self):
        """Convert settings to dictionary for API responses"""
        return {
            'id': self.id,
            'contractor_id': self.contractor_id,
            'base_labor_rate': float(self.base_labor_rate),
            'markup_percentage': float(self.markup_percentage),
            'region': self.region,
            'cost_of_living_multiplier': float(self.cost_of_living_multiplier),
            'business_name': self.business_name,
            'license_number': self.license_number,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }

class ServiceCategory(db.Model):
    """
    Model for electrical service categories (EL-01 through EL-18)
    """
    __tablename__ = 'service_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    category_code = db.Column(db.String(5), unique=True, nullable=False, index=True)  # e.g., EL-01
    category_name = db.Column(db.String(100), nullable=False)  # e.g., "Troubleshooting & Code Repair"
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(200), nullable=True)  # Path to category image
    sort_order = db.Column(db.Integer, default=0)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<ServiceCategory {self.category_code}: {self.category_name}>'
    
    def to_dict(self):
        """Convert category to dictionary for API responses"""
        return {
            'id': self.id,
            'category_code': self.category_code,
            'category_name': self.category_name,
            'description': self.description,
            'image_url': self.image_url,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }

class Estimate(db.Model):
    """
    Model for customer estimates
    """
    __tablename__ = 'estimates'
    
    id = db.Column(db.Integer, primary_key=True)
    estimate_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    contractor_id = db.Column(db.String(50), nullable=False, index=True)
    
    # Customer information
    customer_name = db.Column(db.String(200), nullable=False)
    customer_email = db.Column(db.String(200), nullable=True)
    customer_phone = db.Column(db.String(20), nullable=True)
    customer_address = db.Column(db.Text, nullable=True)
    
    # Estimate details
    total_amount = db.Column(Numeric(12, 2), nullable=False)
    labor_total = db.Column(Numeric(12, 2), nullable=False)
    material_total = db.Column(Numeric(12, 2), nullable=False)
    tax_amount = db.Column(Numeric(12, 2), default=0.00)
    
    # Status
    status = db.Column(db.String(20), default='draft')  # draft, sent, approved, rejected
    notes = db.Column(db.Text, nullable=True)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Estimate {self.estimate_number}: {self.customer_name}>'
    
    def to_dict(self):
        """Convert estimate to dictionary for API responses"""
        return {
            'id': self.id,
            'estimate_number': self.estimate_number,
            'contractor_id': self.contractor_id,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'customer_address': self.customer_address,
            'total_amount': float(self.total_amount),
            'labor_total': float(self.labor_total),
            'material_total': float(self.material_total),
            'tax_amount': float(self.tax_amount),
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class EstimateItem(db.Model):
    """
    Model for individual items in an estimate
    """
    __tablename__ = 'estimate_items'
    
    id = db.Column(db.Integer, primary_key=True)
    estimate_id = db.Column(db.Integer, db.ForeignKey('estimates.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('electrical_services.id'), nullable=False)
    
    # Item details
    quantity = db.Column(db.Integer, default=1)
    unit_price = db.Column(Numeric(10, 2), nullable=False)
    total_price = db.Column(Numeric(12, 2), nullable=False)
    
    # Custom adjustments
    custom_description = db.Column(db.Text, nullable=True)  # Override service description
    discount_percentage = db.Column(Numeric(5, 2), default=0.00)
    
    # Relationships
    estimate = db.relationship('Estimate', backref=db.backref('items', lazy=True))
    service = db.relationship('ElectricalService', backref=db.backref('estimate_items', lazy=True))
    
    def __repr__(self):
        return f'<EstimateItem {self.id}: {self.quantity}x {self.service.service_name if self.service else "Unknown"}>'
    
    def to_dict(self):
        """Convert estimate item to dictionary for API responses"""
        return {
            'id': self.id,
            'estimate_id': self.estimate_id,
            'service_id': self.service_id,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price),
            'total_price': float(self.total_price),
            'custom_description': self.custom_description,
            'discount_percentage': float(self.discount_percentage),
            'service': self.service.to_dict() if self.service else None
        }

