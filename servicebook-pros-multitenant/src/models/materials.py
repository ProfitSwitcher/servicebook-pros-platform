"""
Materials catalog models for ServiceBook Pros
Supports plumbing, HVAC, and electrical materials
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric, ForeignKey
from .user import db
from .company import Company

class MaterialCategory(db.Model):
    """Material categories (Plumbing, HVAC, Electrical, etc.)"""
    __tablename__ = 'material_categories'
    
    id = Column(Integer, primary_key=True)
    category_code = Column(String(10), unique=True, nullable=False)  # PLB, HVAC, EL
    category_name = Column(String(255), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'category_code': self.category_code,
            'category_name': self.category_name,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class MaterialSubcategory(db.Model):
    """Material subcategories (Pipes, Fittings, Valves, etc.)"""
    __tablename__ = 'material_subcategories'
    
    id = Column(Integer, primary_key=True)
    category_code = Column(String(10), ForeignKey('material_categories.category_code'), nullable=False)
    subcategory_code = Column(String(15), unique=True, nullable=False)  # PLB-PIPE, HVAC-DUCT
    subcategory_name = Column(String(255), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    category = db.relationship('MaterialCategory', backref='subcategories')
    
    def to_dict(self):
        return {
            'id': self.id,
            'category_code': self.category_code,
            'subcategory_code': self.subcategory_code,
            'subcategory_name': self.subcategory_name,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class MasterMaterial(db.Model):
    """Master materials catalog (shared across all companies)"""
    __tablename__ = 'master_materials'
    
    id = Column(Integer, primary_key=True)
    material_code = Column(String(20), unique=True, nullable=False)  # PLB-PIPE-001
    material_name = Column(String(255), nullable=False)
    description = Column(Text)
    category_code = Column(String(10), ForeignKey('material_categories.category_code'), nullable=False)
    subcategory_code = Column(String(15), ForeignKey('material_subcategories.subcategory_code'))
    unit_of_measure = Column(String(20), nullable=False)  # each, ft, lb, etc.
    base_cost = Column(Numeric(10, 2), nullable=False)
    supplier_part_number = Column(String(100))
    manufacturer = Column(String(255))
    specifications = Column(Text)  # JSON string for detailed specs
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = db.relationship('MaterialCategory', backref='materials')
    subcategory = db.relationship('MaterialSubcategory', backref='materials')
    
    def to_dict(self):
        return {
            'id': self.id,
            'material_code': self.material_code,
            'material_name': self.material_name,
            'description': self.description,
            'category_code': self.category_code,
            'subcategory_code': self.subcategory_code,
            'unit_of_measure': self.unit_of_measure,
            'base_cost': float(self.base_cost) if self.base_cost else None,
            'supplier_part_number': self.supplier_part_number,
            'manufacturer': self.manufacturer,
            'specifications': self.specifications,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CompanyMaterial(db.Model):
    """Company-specific material pricing and preferences"""
    __tablename__ = 'company_materials'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    material_code = Column(String(20), ForeignKey('master_materials.material_code'), nullable=False)
    custom_cost = Column(Numeric(10, 2))  # Override base cost
    markup_percentage = Column(Numeric(5, 2), default=0.0)  # Markup percentage
    preferred_supplier = Column(String(255))
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    master_material = db.relationship('MasterMaterial', backref='company_materials')
    
    @property
    def effective_cost(self):
        """Calculate effective cost with custom pricing and markup"""
        base_cost = float(self.custom_cost or self.master_material.base_cost or 0.0)
        markup = float(self.markup_percentage or 0.0) / 100.0
        return base_cost * (1 + markup)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'material_code': self.material_code,
            'custom_cost': float(self.custom_cost) if self.custom_cost else None,
            'markup_percentage': float(self.markup_percentage) if self.markup_percentage else None,
            'effective_cost': self.effective_cost,
            'preferred_supplier': self.preferred_supplier,
            'notes': self.notes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'master_material': self.master_material.to_dict() if self.master_material else None
        }

