#!/usr/bin/env python3
"""
Populate sample master services and demonstrate company-specific pricing
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db
from src.models.pricing import (
    ServiceCategory, ServiceSubcategory, MasterService,
    CompanyService, CompanyTaxRate, CompanyLaborRate
)
from src.models.company import Company

def populate_sample_data():
    """Populate sample master services for demonstration"""
    
    with app.app_context():
        print("🔄 Populating sample master services...")
        
        # Create sample categories
        categories = [
            {
                'category_code': 'EL-01',
                'category_name': 'Troubleshooting & Code Repair',
                'description': 'Electrical troubleshooting and code compliance services',
                'sort_order': 1
            },
            {
                'category_code': 'EL-02', 
                'category_name': 'Outlets & Switches',
                'description': 'Installation and repair of outlets and switches',
                'sort_order': 2
            },
            {
                'category_code': 'EL-03',
                'category_name': 'Lighting',
                'description': 'Lighting installation and repair services',
                'sort_order': 3
            }
        ]
        
        for cat_data in categories:
            category = ServiceCategory.query.filter_by(category_code=cat_data['category_code']).first()
            if not category:
                category = ServiceCategory(**cat_data)
                db.session.add(category)
        
        # Create sample subcategories
        subcategories = [
            {
                'category_code': 'EL-01',
                'subcategory_code': 'EL-01-A',
                'subcategory_name': 'Safety Inspections',
                'sort_order': 1
            },
            {
                'category_code': 'EL-01',
                'subcategory_code': 'EL-01-B',
                'subcategory_name': 'Code Violations',
                'sort_order': 2
            },
            {
                'category_code': 'EL-02',
                'subcategory_code': 'EL-02-A',
                'subcategory_name': 'Standard Outlets',
                'sort_order': 1
            },
            {
                'category_code': 'EL-02',
                'subcategory_code': 'EL-02-B',
                'subcategory_name': 'GFCI Outlets',
                'sort_order': 2
            }
        ]
        
        for subcat_data in subcategories:
            subcategory = ServiceSubcategory.query.filter_by(subcategory_code=subcat_data['subcategory_code']).first()
            if not subcategory:
                subcategory = ServiceSubcategory(**subcat_data)
                db.session.add(subcategory)
        
        # Create sample master services
        services = [
            {
                'service_code': 'EL-01-001',
                'category_code': 'EL-01',
                'subcategory_code': 'EL-01-A',
                'service_name': 'Basic Electrical Safety Inspection',
                'description': 'Comprehensive safety inspection of electrical systems including panel, outlets, and wiring',
                'base_labor_hours': 2.0,
                'base_material_cost': 25.00,
                'base_price': 325.00,
                'original_code': 'T700001'
            },
            {
                'service_code': 'EL-01-002',
                'category_code': 'EL-01',
                'subcategory_code': 'EL-01-B',
                'service_name': 'Code Violation Repair - Minor',
                'description': 'Repair minor electrical code violations such as improper grounding or missing GFCI protection',
                'base_labor_hours': 1.5,
                'base_material_cost': 45.00,
                'base_price': 270.00,
                'original_code': 'T700002'
            },
            {
                'service_code': 'EL-02-001',
                'category_code': 'EL-02',
                'subcategory_code': 'EL-02-A',
                'service_name': 'Install Standard Outlet',
                'description': 'Install new standard 15A or 20A outlet with proper wiring and box',
                'base_labor_hours': 1.0,
                'base_material_cost': 35.00,
                'base_price': 185.00,
                'original_code': 'T800001'
            },
            {
                'service_code': 'EL-02-002',
                'category_code': 'EL-02',
                'subcategory_code': 'EL-02-B',
                'service_name': 'Install GFCI Outlet',
                'description': 'Install new GFCI outlet with proper wiring and testing for safety compliance',
                'base_labor_hours': 1.25,
                'base_material_cost': 55.00,
                'base_price': 242.50,
                'original_code': 'T800002'
            },
            {
                'service_code': 'EL-03-001',
                'category_code': 'EL-03',
                'subcategory_code': None,
                'service_name': 'Install Ceiling Light Fixture',
                'description': 'Install standard ceiling light fixture with switch control',
                'base_labor_hours': 1.5,
                'base_material_cost': 75.00,
                'base_price': 300.00,
                'original_code': 'T900001'
            }
        ]
        
        for service_data in services:
            service = MasterService.query.filter_by(service_code=service_data['service_code']).first()
            if not service:
                service = MasterService(**service_data)
                db.session.add(service)
        
        db.session.commit()
        print("✅ Sample master services populated successfully!")
        
        # Create sample tax rates for existing companies
        companies = Company.query.all()
        for company in companies:
            # Check if company already has tax rates
            existing_tax_rates = CompanyTaxRate.query.filter_by(company_id=company.id).count()
            if existing_tax_rates == 0:
                # Create default tax rates based on company state
                if company.state == 'CO':  # Colorado
                    tax_rates = [
                        {'tax_name': 'State Sales Tax', 'tax_rate': 0.029, 'is_default': False},
                        {'tax_name': 'Local Sales Tax', 'tax_rate': 0.0535, 'is_default': False},
                        {'tax_name': 'Combined Tax Rate', 'tax_rate': 0.0825, 'is_default': True}
                    ]
                elif company.state == 'FL':  # Florida
                    tax_rates = [
                        {'tax_name': 'State Sales Tax', 'tax_rate': 0.06, 'is_default': False},
                        {'tax_name': 'Local Sales Tax', 'tax_rate': 0.01, 'is_default': False},
                        {'tax_name': 'Combined Tax Rate', 'tax_rate': 0.07, 'is_default': True}
                    ]
                else:
                    tax_rates = [
                        {'tax_name': 'Sales Tax', 'tax_rate': 0.0875, 'is_default': True}
                    ]
                
                for tax_data in tax_rates:
                    tax_rate = CompanyTaxRate(
                        company_id=company.id,
                        **tax_data
                    )
                    db.session.add(tax_rate)
            
            # Check if company already has labor rates
            existing_labor_rates = CompanyLaborRate.query.filter_by(company_id=company.id).count()
            if existing_labor_rates == 0:
                # Create default labor rates
                labor_rates = [
                    {
                        'rate_name': 'Standard Rate',
                        'hourly_cost': float(company.default_labor_rate) * 0.6,  # 60% cost
                        'hourly_price': float(company.default_labor_rate),
                        'is_default': True
                    },
                    {
                        'rate_name': 'Emergency Rate', 
                        'hourly_cost': float(company.default_labor_rate) * 0.6,
                        'hourly_price': float(company.default_labor_rate) * 1.5,  # 50% premium
                        'is_default': False
                    }
                ]
                
                for labor_data in labor_rates:
                    labor_rate = CompanyLaborRate(
                        company_id=company.id,
                        **labor_data
                    )
                    db.session.add(labor_rate)
        
        db.session.commit()
        print("✅ Sample tax rates and labor rates created for companies!")
        
        print("\n📊 Sample Data Summary:")
        print(f"   Categories: {ServiceCategory.query.count()}")
        print(f"   Subcategories: {ServiceSubcategory.query.count()}")
        print(f"   Master Services: {MasterService.query.count()}")
        print(f"   Companies: {Company.query.count()}")
        print(f"   Tax Rates: {CompanyTaxRate.query.count()}")
        print(f"   Labor Rates: {CompanyLaborRate.query.count()}")

if __name__ == '__main__':
    populate_sample_data()

