from src.models.user import db
from datetime import datetime
import enum
import json

class PricingTier(enum.Enum):
    GOOD = 'good'
    BETTER = 'better'
    BEST = 'best'

class ServiceCategory(enum.Enum):
    PLUMBING = 'plumbing'
    ELECTRICAL = 'electrical'
    HVAC = 'hvac'
    GENERAL = 'general'
    APPLIANCE = 'appliance'
    DRAIN_CLEANING = 'drain_cleaning'
    WATER_HEATER = 'water_heater'
    FIXTURE_REPAIR = 'fixture_repair'
    PIPE_REPAIR = 'pipe_repair'
    EMERGENCY = 'emergency'

class FlatRatePricingItem(db.Model):
    __tablename__ = 'flat_rate_pricing_items'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Item identification
    item_code = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)  # Detailed description as preferred
    category = db.Column(db.Enum(ServiceCategory), nullable=False)
    subcategory = db.Column(db.String(100))
    
    # Pricing tiers (Good/Better/Best model like Profit Rhino)
    good_price = db.Column(db.Float, nullable=False)
    better_price = db.Column(db.Float, nullable=False)
    best_price = db.Column(db.Float, nullable=False)
    
    # Labor components
    labor_hours = db.Column(db.Float, default=0.0)
    base_labor_rate = db.Column(db.Float, default=75.0)  # Adjustable labor rate
    
    # Material costs
    material_cost = db.Column(db.Float, default=0.0)
    markup_percentage = db.Column(db.Float, default=20.0)
    
    # Additional options
    warranty_included = db.Column(db.Boolean, default=True)
    warranty_period_months = db.Column(db.Integer, default=12)
    
    # Metadata
    is_active = db.Column(db.Boolean, default=True)
    is_emergency = db.Column(db.Boolean, default=False)
    difficulty_level = db.Column(db.Integer, default=1)  # 1-5 scale
    
    # Tags and keywords for search
    tags = db.Column(db.Text)  # JSON array of tags
    keywords = db.Column(db.Text)  # Searchable keywords
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'item_code': self.item_code,
            'title': self.title,
            'description': self.description,
            'category': self.category.value if self.category else None,
            'subcategory': self.subcategory,
            'good_price': self.good_price,
            'better_price': self.better_price,
            'best_price': self.best_price,
            'labor_hours': self.labor_hours,
            'base_labor_rate': self.base_labor_rate,
            'material_cost': self.material_cost,
            'markup_percentage': self.markup_percentage,
            'warranty_included': self.warranty_included,
            'warranty_period_months': self.warranty_period_months,
            'is_active': self.is_active,
            'is_emergency': self.is_emergency,
            'difficulty_level': self.difficulty_level,
            'tags': json.loads(self.tags) if self.tags else [],
            'keywords': self.keywords,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def calculate_prices_with_labor_rate(self, new_labor_rate):
        """Calculate new prices when labor rate is adjusted"""
        labor_cost_difference = (new_labor_rate - self.base_labor_rate) * self.labor_hours
        
        return {
            'good_price': self.good_price + labor_cost_difference,
            'better_price': self.better_price + labor_cost_difference,
            'best_price': self.best_price + labor_cost_difference
        }
    
    def update_prices_for_labor_rate(self, new_labor_rate):
        """Update prices when labor rate changes"""
        new_prices = self.calculate_prices_with_labor_rate(new_labor_rate)
        
        self.good_price = new_prices['good_price']
        self.better_price = new_prices['better_price']
        self.best_price = new_prices['best_price']
        self.base_labor_rate = new_labor_rate
        self.updated_at = datetime.utcnow()

class PricingTemplate(db.Model):
    __tablename__ = 'pricing_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Template details
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.Enum(ServiceCategory), nullable=False)
    
    # Default settings
    default_labor_rate = db.Column(db.Float, default=75.0)
    default_markup_percentage = db.Column(db.Float, default=20.0)
    default_warranty_months = db.Column(db.Integer, default=12)
    
    # Pricing multipliers for tiers
    good_multiplier = db.Column(db.Float, default=1.0)
    better_multiplier = db.Column(db.Float, default=1.3)
    best_multiplier = db.Column(db.Float, default=1.6)
    
    # Metadata
    is_active = db.Column(db.Boolean, default=True)
    is_default = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'name': self.name,
            'description': self.description,
            'category': self.category.value if self.category else None,
            'default_labor_rate': self.default_labor_rate,
            'default_markup_percentage': self.default_markup_percentage,
            'default_warranty_months': self.default_warranty_months,
            'good_multiplier': self.good_multiplier,
            'better_multiplier': self.better_multiplier,
            'best_multiplier': self.best_multiplier,
            'is_active': self.is_active,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CompanyPricingSettings(db.Model):
    __tablename__ = 'company_pricing_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False, unique=True)
    
    # Global labor rate (affects all pricing when changed)
    global_labor_rate = db.Column(db.Float, default=75.0)
    
    # Default markup settings
    default_material_markup = db.Column(db.Float, default=20.0)
    emergency_surcharge_percentage = db.Column(db.Float, default=50.0)
    
    # Pricing display settings
    show_good_tier = db.Column(db.Boolean, default=True)
    show_better_tier = db.Column(db.Boolean, default=True)
    show_best_tier = db.Column(db.Boolean, default=True)
    
    # Default tier names (customizable)
    good_tier_name = db.Column(db.String(50), default='Good')
    better_tier_name = db.Column(db.String(50), default='Better')
    best_tier_name = db.Column(db.String(50), default='Best')
    
    # Pricing rules
    minimum_service_charge = db.Column(db.Float, default=89.0)
    diagnostic_fee = db.Column(db.Float, default=89.0)
    trip_charge = db.Column(db.Float, default=0.0)
    
    # Discount settings
    senior_discount_percentage = db.Column(db.Float, default=10.0)
    military_discount_percentage = db.Column(db.Float, default=10.0)
    first_time_discount_percentage = db.Column(db.Float, default=15.0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'global_labor_rate': self.global_labor_rate,
            'default_material_markup': self.default_material_markup,
            'emergency_surcharge_percentage': self.emergency_surcharge_percentage,
            'show_good_tier': self.show_good_tier,
            'show_better_tier': self.show_better_tier,
            'show_best_tier': self.show_best_tier,
            'good_tier_name': self.good_tier_name,
            'better_tier_name': self.better_tier_name,
            'best_tier_name': self.best_tier_name,
            'minimum_service_charge': self.minimum_service_charge,
            'diagnostic_fee': self.diagnostic_fee,
            'trip_charge': self.trip_charge,
            'senior_discount_percentage': self.senior_discount_percentage,
            'military_discount_percentage': self.military_discount_percentage,
            'first_time_discount_percentage': self.first_time_discount_percentage,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class PricingHistory(db.Model):
    __tablename__ = 'pricing_history'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    pricing_item_id = db.Column(db.Integer, db.ForeignKey('flat_rate_pricing_items.id'), nullable=False)
    
    # Historical pricing data
    old_good_price = db.Column(db.Float)
    old_better_price = db.Column(db.Float)
    old_best_price = db.Column(db.Float)
    new_good_price = db.Column(db.Float)
    new_better_price = db.Column(db.Float)
    new_best_price = db.Column(db.Float)
    
    # Change details
    change_reason = db.Column(db.String(200))
    changed_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    labor_rate_change = db.Column(db.Float)  # If change was due to labor rate adjustment
    
    # Timestamp
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'pricing_item_id': self.pricing_item_id,
            'old_good_price': self.old_good_price,
            'old_better_price': self.old_better_price,
            'old_best_price': self.old_best_price,
            'new_good_price': self.new_good_price,
            'new_better_price': self.new_better_price,
            'new_best_price': self.new_best_price,
            'change_reason': self.change_reason,
            'changed_by_user_id': self.changed_by_user_id,
            'labor_rate_change': self.labor_rate_change,
            'changed_at': self.changed_at.isoformat() if self.changed_at else None
        }

