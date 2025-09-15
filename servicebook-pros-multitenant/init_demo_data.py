#!/usr/bin/env python3
"""
Initialize demo data for ServiceBook Pros Multi-Tenant system
This script creates demo companies and users for testing
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask
from src.models.user import db, User
from src.models.company import Company, CompanyUser
from src.models.pricing import ServiceCategory, MasterService
from werkzeug.security import generate_password_hash
import uuid

def init_demo_data():
    """Initialize demo companies and users"""
    
    # Check if demo users already exist
    existing_user = User.query.filter_by(username='elite_admin').first()
    if existing_user:
        print("Demo data already exists, skipping initialization")
        return
    
    print("Initializing demo data...")
    
    # Create Elite Electrical Services
    elite_company = Company(
        company_name="Elite Electrical Services",
        company_code="ELITE001",
        contact_email="info@eliteelectrical.com",
        contact_phone="512-555-0123",
        address="123 Main Street",
        city="Austin",
        state="TX",
        zip_code="78701",
        default_labor_rate=195.00,
        default_tax_rate=0.0825
    )
    db.session.add(elite_company)
    db.session.flush()  # Get the ID
    
    # Create Elite admin user
    elite_user = User(
        username="elite_admin",
        email="admin@eliteelectrical.com",
        password_hash=generate_password_hash("elite123"),
        first_name="Sarah",
        last_name="Johnson",
        user_type="company_user",
        is_active=True,
        is_verified=True
    )
    db.session.add(elite_user)
    db.session.flush()
    
    # Link user to company
    elite_company_user = CompanyUser(
        user_id=elite_user.id,
        company_id=elite_company.id,
        role="admin",
        is_active=True
    )
    db.session.add(elite_company_user)
    
    # Create Coastal Electric Co
    coastal_company = Company(
        company_name="Coastal Electric Co",
        company_code="COASTAL01",
        contact_email="info@coastalelectric.com",
        contact_phone="305-555-0456",
        address="456 Ocean Drive",
        city="Miami",
        state="FL",
        zip_code="33139",
        default_labor_rate=175.00,
        default_tax_rate=0.07
    )
    db.session.add(coastal_company)
    db.session.flush()
    
    # Create Coastal admin user
    coastal_user = User(
        username="coastal_admin",
        email="admin@coastalelectric.com",
        password_hash=generate_password_hash("coastal123"),
        first_name="Mike",
        last_name="Rodriguez",
        user_type="company_user",
        is_active=True,
        is_verified=True
    )
    db.session.add(coastal_user)
    db.session.flush()
    
    # Link user to company
    coastal_company_user = CompanyUser(
        user_id=coastal_user.id,
        company_id=coastal_company.id,
        role="admin",
        is_active=True
    )
    db.session.add(coastal_company_user)
    
    # Create system admin
    system_admin = User(
        username="system_admin",
        email="admin@servicebookpros.com",
        password_hash=generate_password_hash("admin123"),
        first_name="System",
        last_name="Administrator",
        user_type="admin",
        is_active=True,
        is_verified=True
    )
    db.session.add(system_admin)
    
    # Create some sample service categories
    categories = [
        {"code": "EL-01", "name": "Troubleshooting & Code Repair", "description": "Electrical troubleshooting and code compliance"},
        {"code": "EL-02", "name": "Outlets & Switches", "description": "Installation and repair of outlets and switches"},
        {"code": "EL-03", "name": "Lighting", "description": "Lighting installation and repair"},
        {"code": "EL-04", "name": "Panel & Breaker Work", "description": "Electrical panel and breaker services"},
        {"code": "EL-05", "name": "Wiring & Circuits", "description": "Electrical wiring and circuit installation"}
    ]
    
    for cat_data in categories:
        existing_cat = ServiceCategory.query.filter_by(category_code=cat_data["code"]).first()
        if not existing_cat:
            category = ServiceCategory(
                category_code=cat_data["code"],
                category_name=cat_data["name"],
                description=cat_data["description"]
            )
            db.session.add(category)
    
    # Create some sample master services
    services = [
        {
            "code": "EL-01-001",
            "name": "Basic Electrical Safety Inspection",
            "description": "Comprehensive electrical safety inspection of residential or commercial property",
            "category": "EL-01",
            "base_price": 325.00,
            "base_labor_hours": 2.0,
            "base_material_cost": 25.00
        },
        {
            "code": "EL-01-002", 
            "name": "Code Violation Repair - Minor",
            "description": "Repair minor electrical code violations identified during inspection",
            "category": "EL-01",
            "base_price": 270.00,
            "base_labor_hours": 1.5,
            "base_material_cost": 45.00
        },
        {
            "code": "EL-02-001",
            "name": "Install Standard Outlet",
            "description": "Install new standard 15A or 20A electrical outlet",
            "category": "EL-02", 
            "base_price": 185.00,
            "base_labor_hours": 1.0,
            "base_material_cost": 35.00
        },
        {
            "code": "EL-03-001",
            "name": "Install Ceiling Light Fixture",
            "description": "Install new ceiling-mounted light fixture with switch",
            "category": "EL-03",
            "base_price": 300.00,
            "base_labor_hours": 1.5,
            "base_material_cost": 75.00
        }
    ]
    
    for svc_data in services:
        existing_svc = MasterService.query.filter_by(service_code=svc_data["code"]).first()
        if not existing_svc:
            service = MasterService(
                service_code=svc_data["code"],
                service_name=svc_data["name"],
                description=svc_data["description"],
                category_code=svc_data["category"],
                base_price=svc_data["base_price"],
                base_labor_hours=svc_data["base_labor_hours"],
                base_material_cost=svc_data["base_material_cost"]
            )
            db.session.add(service)
    
    try:
        db.session.commit()
        print("✅ Demo data initialized successfully!")
        print("Demo accounts created:")
        print("- elite_admin / elite123 (Elite Electrical Services)")
        print("- coastal_admin / coastal123 (Coastal Electric Co)")
        print("- system_admin / admin123 (System Administrator)")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error initializing demo data: {e}")
        raise

if __name__ == '__main__':
    # Create Flask app context
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        init_demo_data()

