from src.models.user import db
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric, ForeignKey

class ServiceCategory(db.Model):
    """Master service categories (shared across all companies)"""
    __tablename__ = 'service_categories'
    
    id = Column(Integer, primary_key=True)
    category_code = Column(String(10), unique=True, nullable=False)  # EL-01, EL-02, etc.
    category_name = Column(String(255), nullable=False)
    description = Column(Text)
    image_url = Column(String(500))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'category_code': self.category_code,
            'category_name': self.category_name,
            'description': self.description,
            'image_url': self.image_url,
            'sort_order': self.sort_order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ServiceSubcategory(db.Model):
    """Master service subcategories (shared across all companies)"""
    __tablename__ = 'service_subcategories'
    
    id = Column(Integer, primary_key=True)
    category_code = Column(String(10), ForeignKey('service_categories.category_code'), nullable=False)
    subcategory_code = Column(String(15), unique=True, nullable=False)  # EL-01-A, EL-01-B, etc.
    subcategory_name = Column(String(255), nullable=False)
    description = Column(Text)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    category = db.relationship('ServiceCategory', backref='subcategories')
    
    def to_dict(self):
        return {
            'id': self.id,
            'category_code': self.category_code,
            'subcategory_code': self.subcategory_code,
            'subcategory_name': self.subcategory_name,
            'description': self.description,
            'sort_order': self.sort_order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class MasterService(db.Model):
    """Master services catalog (shared across all companies)"""
    __tablename__ = 'master_services'
    
    id = Column(Integer, primary_key=True)
    service_code = Column(String(20), unique=True, nullable=False)  # EL-01-001, EL-01-002, etc.
    category_code = Column(String(10), ForeignKey('service_categories.category_code'), nullable=False)
    subcategory_code = Column(String(15), ForeignKey('service_subcategories.subcategory_code'))
    service_name = Column(String(500), nullable=False)
    description = Column(Text)
    
    # Base pricing (regional averages)
    base_labor_hours = Column(Numeric(5, 2), default=1.0)
    base_material_cost = Column(Numeric(10, 2), default=0.0)
    base_price = Column(Numeric(10, 2), nullable=False)
    
    # Metadata
    original_code = Column(String(50))  # Original TRO/SER code
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = db.relationship('ServiceCategory', backref='master_services')
    subcategory = db.relationship('ServiceSubcategory', backref='master_services')
    
    def to_dict(self):
        return {
            'id': self.id,
            'service_code': self.service_code,
            'category_code': self.category_code,
            'subcategory_code': self.subcategory_code,
            'service_name': self.service_name,
            'description': self.description,
            'base_labor_hours': float(self.base_labor_hours) if self.base_labor_hours else None,
            'base_material_cost': float(self.base_material_cost) if self.base_material_cost else None,
            'base_price': float(self.base_price) if self.base_price else None,
            'original_code': self.original_code,
            'sort_order': self.sort_order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CompanyService(db.Model):
    """Company-specific service pricing (overrides master pricing)"""
    __tablename__ = 'company_services'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    service_code = Column(String(20), ForeignKey('master_services.service_code'), nullable=False)
    
    # Company-specific pricing
    custom_price = Column(Numeric(10, 2))  # If null, use calculated price
    custom_labor_hours = Column(Numeric(5, 2))  # If null, use master labor hours
    custom_material_cost = Column(Numeric(10, 2))  # If null, use master material cost
    
    # Pricing adjustments
    price_adjustment_percent = Column(Numeric(5, 2), default=0.0)  # +/- percentage
    price_adjustment_amount = Column(Numeric(10, 2), default=0.0)  # +/- fixed amount
    
    # Service customization
    custom_name = Column(String(500))  # If null, use master name
    custom_description = Column(Text)  # If null, use master description
    
    # Status
    is_active = Column(Boolean, default=True)
    is_hidden = Column(Boolean, default=False)  # Hide from estimates
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = db.relationship('Company', backref='custom_services')
    master_service = db.relationship('MasterService', backref='company_customizations')
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('company_id', 'service_code', name='unique_company_service'),)
    
    def get_effective_price(self, company_labor_rate=None):
        """Calculate the effective price for this company"""
        # Start with custom price if set
        if self.custom_price:
            base_price = float(self.custom_price)
        else:
            # Calculate from labor hours and material cost
            labor_hours = float(self.custom_labor_hours or self.master_service.base_labor_hours or 1.0)
            material_cost = float(self.custom_material_cost or self.master_service.base_material_cost or 0.0)
            labor_rate = float(company_labor_rate or 150.0)  # Default rate
            
            base_price = (labor_hours * labor_rate) + material_cost
        
        # Apply adjustments
        if self.price_adjustment_percent:
            base_price *= (1 + float(self.price_adjustment_percent) / 100)
        
        if self.price_adjustment_amount:
            base_price += float(self.price_adjustment_amount)
        
        return round(base_price, 2)
    
    def to_dict(self, company_labor_rate=None):
        master = self.master_service
        return {
            'id': self.id,
            'company_id': self.company_id,
            'service_code': self.service_code,
            'service_name': self.custom_name or (master.service_name if master else ''),
            'description': self.custom_description or (master.description if master else ''),
            'category_code': master.category_code if master else '',
            'subcategory_code': master.subcategory_code if master else '',
            'custom_price': float(self.custom_price) if self.custom_price else None,
            'custom_labor_hours': float(self.custom_labor_hours) if self.custom_labor_hours else None,
            'custom_material_cost': float(self.custom_material_cost) if self.custom_material_cost else None,
            'price_adjustment_percent': float(self.price_adjustment_percent) if self.price_adjustment_percent else 0.0,
            'price_adjustment_amount': float(self.price_adjustment_amount) if self.price_adjustment_amount else 0.0,
            'effective_price': self.get_effective_price(company_labor_rate),
            'base_price': float(master.base_price) if master and master.base_price else 0.0,
            'is_active': self.is_active,
            'is_hidden': self.is_hidden,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CompanyTaxRate(db.Model):
    """Company-specific tax rates"""
    __tablename__ = 'company_tax_rates'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    tax_name = Column(String(100), nullable=False)  # "Sales Tax", "County Tax", etc.
    tax_rate = Column(Numeric(5, 4), nullable=False)  # 0.0875 = 8.75%
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = db.relationship('Company', backref='tax_rates')
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'tax_name': self.tax_name,
            'tax_rate': float(self.tax_rate) if self.tax_rate else 0.0,
            'tax_rate_percent': float(self.tax_rate * 100) if self.tax_rate else 0.0,
            'is_default': self.is_default,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CompanyLaborRate(db.Model):
    """Company-specific labor rates"""
    __tablename__ = 'company_labor_rates'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    rate_name = Column(String(100), nullable=False)  # "Standard", "Emergency", "Weekend", etc.
    hourly_cost = Column(Numeric(8, 2), nullable=False)  # What company pays
    hourly_price = Column(Numeric(8, 2), nullable=False)  # What customer pays
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = db.relationship('Company', backref='labor_rates')
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'rate_name': self.rate_name,
            'hourly_cost': float(self.hourly_cost) if self.hourly_cost else 0.0,
            'hourly_price': float(self.hourly_price) if self.hourly_price else 0.0,
            'markup_percent': round(((float(self.hourly_price) - float(self.hourly_cost)) / float(self.hourly_cost) * 100), 2) if self.hourly_cost and self.hourly_cost > 0 else 0.0,
            'is_default': self.is_default,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

