#!/usr/bin/env python3
"""
ServiceBook Pros Database Population Script
Populates the database with electrical service categories and services
using the EL-XX-XXX coding system and data from flat rate files
"""

import os
import sys
import re
import glob
from decimal import Decimal

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.main import app
from src.models.pricing import (
    db, ElectricalService, ServiceCategory, PricingSettings
)

# ServiceBook Pros electrical service categories
ELECTRICAL_CATEGORIES = [
    {
        'category_code': 'EL-01',
        'category_name': 'Troubleshooting & Code Repair',
        'description': 'Electrical diagnostics, inspections, and code compliance',
        'image_url': '/images/troubleshooting_repair.jpg',
        'sort_order': 1
    },
    {
        'category_code': 'EL-02',
        'category_name': 'Service Entrances & Upgrades',
        'description': 'Main service upgrades and electrical entrance work',
        'image_url': '/images/panel_upgrade.jpg',
        'sort_order': 2
    },
    {
        'category_code': 'EL-03',
        'category_name': 'Panels & Sub Panels',
        'description': 'Electrical panel installation and upgrades',
        'image_url': '/images/panel_upgrade.jpg',
        'sort_order': 3
    },
    {
        'category_code': 'EL-04',
        'category_name': 'Breakers & Fuses',
        'description': 'Circuit breaker and fuse installation/replacement',
        'image_url': '/images/panel_upgrade.jpg',
        'sort_order': 4
    },
    {
        'category_code': 'EL-05',
        'category_name': 'Switches & Outlets',
        'description': 'Switch and outlet installation and repair',
        'image_url': '/images/outlets_switches.jpg',
        'sort_order': 5
    },
    {
        'category_code': 'EL-06',
        'category_name': 'Wiring & Circuits',
        'description': 'New circuit installation and wiring services',
        'image_url': '/images/appliance_wiring.jpg',
        'sort_order': 6
    },
    {
        'category_code': 'EL-07',
        'category_name': 'Interior Lighting',
        'description': 'Indoor lighting installation and repair',
        'image_url': '/images/interior_lighting.jpg',
        'sort_order': 7
    },
    {
        'category_code': 'EL-08',
        'category_name': 'Exterior Lighting',
        'description': 'Outdoor lighting and security lighting',
        'image_url': '/images/interior_lighting.jpg',
        'sort_order': 8
    },
    {
        'category_code': 'EL-09',
        'category_name': 'Ceiling Fans',
        'description': 'Ceiling fan installation and repair services',
        'image_url': '/images/ceiling_fans.jpg',
        'sort_order': 9
    },
    {
        'category_code': 'EL-10',
        'category_name': 'Home Automation',
        'description': 'Smart home and automation system installation',
        'image_url': '/images/home_automation.jpg',
        'sort_order': 10
    },
    {
        'category_code': 'EL-11',
        'category_name': 'Fire & Safety',
        'description': 'Smoke detectors and safety system installation',
        'image_url': '/images/fire_safety.jpg',
        'sort_order': 11
    },
    {
        'category_code': 'EL-12',
        'category_name': 'Generators',
        'description': 'Generator installation and maintenance services',
        'image_url': '/images/generators.jpg',
        'sort_order': 12
    },
    {
        'category_code': 'EL-13',
        'category_name': 'Appliance Wiring',
        'description': 'Electrical connections for appliances',
        'image_url': '/images/appliance_wiring.jpg',
        'sort_order': 13
    },
    {
        'category_code': 'EL-14',
        'category_name': 'Data & Security',
        'description': 'Network wiring and security system installation',
        'image_url': '/images/data_security.jpg',
        'sort_order': 14
    },
    {
        'category_code': 'EL-15',
        'category_name': 'HVAC Electrical',
        'description': 'Electrical work for heating and cooling systems',
        'image_url': '/images/hvac_electrical.jpg',
        'sort_order': 15
    },
    {
        'category_code': 'EL-16',
        'category_name': 'Water Heater Electrical',
        'description': 'Water heater electrical connections and repair',
        'image_url': '/images/appliance_wiring.jpg',
        'sort_order': 16
    },
    {
        'category_code': 'EL-17',
        'category_name': 'EV Charging Stations',
        'description': 'Electric vehicle charging station installation',
        'image_url': '/images/ev_charging.jpg',
        'sort_order': 17
    },
    {
        'category_code': 'EL-18',
        'category_name': 'Specialty Services',
        'description': 'Custom and specialty electrical services',
        'image_url': '/images/troubleshooting_repair.jpg',
        'sort_order': 18
    }
]

def categorize_service(service_name, description=""):
    """
    Categorize a service based on its name and description
    Returns the appropriate EL-XX category code
    """
    service_text = (service_name + " " + description).lower()
    
    # Troubleshooting & Code Repair (EL-01)
    if any(word in service_text for word in ['troubleshoot', 'diagnose', 'inspect', 'code', 'compliance', 'test', 'check']):
        return 'EL-01'
    
    # Service Entrances & Upgrades (EL-02)
    if any(word in service_text for word in ['service entrance', 'main service', 'meter', 'service upgrade']):
        return 'EL-02'
    
    # Panels & Sub Panels (EL-03)
    if any(word in service_text for word in ['panel', 'sub panel', 'subpanel', 'load center', 'distribution']):
        return 'EL-03'
    
    # Breakers & Fuses (EL-04)
    if any(word in service_text for word in ['breaker', 'fuse', 'circuit breaker', 'gfci breaker', 'afci']):
        return 'EL-04'
    
    # Switches & Outlets (EL-05)
    if any(word in service_text for word in ['switch', 'outlet', 'receptacle', 'dimmer', 'gfci outlet', 'usb outlet']):
        return 'EL-05'
    
    # Wiring & Circuits (EL-06)
    if any(word in service_text for word in ['wire', 'wiring', 'circuit', 'cable', 'conduit', 'romex']):
        return 'EL-06'
    
    # Interior Lighting (EL-07)
    if any(word in service_text for word in ['light', 'lighting', 'fixture', 'chandelier', 'recessed', 'pendant']) and 'outdoor' not in service_text and 'exterior' not in service_text:
        return 'EL-07'
    
    # Exterior Lighting (EL-08)
    if any(word in service_text for word in ['outdoor', 'exterior', 'landscape', 'security light', 'flood light']):
        return 'EL-08'
    
    # Ceiling Fans (EL-09)
    if any(word in service_text for word in ['ceiling fan', 'fan', 'exhaust fan']):
        return 'EL-09'
    
    # Home Automation (EL-10)
    if any(word in service_text for word in ['smart', 'automation', 'home automation', 'smart switch', 'smart home']):
        return 'EL-10'
    
    # Fire & Safety (EL-11)
    if any(word in service_text for word in ['smoke', 'fire', 'alarm', 'detector', 'safety', 'carbon monoxide']):
        return 'EL-11'
    
    # Generators (EL-12)
    if any(word in service_text for word in ['generator', 'backup power', 'standby']):
        return 'EL-12'
    
    # Appliance Wiring (EL-13)
    if any(word in service_text for word in ['appliance', 'dryer', 'washer', 'dishwasher', 'garbage disposal', 'range']):
        return 'EL-13'
    
    # Data & Security (EL-14)
    if any(word in service_text for word in ['data', 'network', 'ethernet', 'security', 'camera', 'doorbell']):
        return 'EL-14'
    
    # HVAC Electrical (EL-15)
    if any(word in service_text for word in ['hvac', 'air conditioning', 'furnace', 'heat pump', 'thermostat']):
        return 'EL-15'
    
    # Water Heater Electrical (EL-16)
    if any(word in service_text for word in ['water heater', 'hot water', 'tankless']):
        return 'EL-16'
    
    # EV Charging Stations (EL-17)
    if any(word in service_text for word in ['ev', 'electric vehicle', 'charging station', 'tesla', 'car charger']):
        return 'EL-17'
    
    # Default to Specialty Services (EL-18)
    return 'EL-18'

def parse_flat_rate_file(file_path):
    """
    Parse a flat rate file and extract service information
    Returns a list of service dictionaries
    """
    services = []
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Split into lines and process
        lines = content.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Skip empty lines and headers
            if not line or line in ['Price book', 'Services', 'Electrical', 'Profit Rhino - Electrical', 'service', 'Description', 'Managed by', 'Task code', 'Base pricing']:
                i += 1
                continue
            
            # Look for service name (usually a descriptive line)
            if line and not line.startswith('$') and not line.startswith('T') and line != 'Profit Rhino':
                service_name = line
                description_parts = []
                
                # Collect description lines until we hit "Profit Rhino"
                i += 1
                while i < len(lines) and lines[i].strip() != 'Profit Rhino':
                    desc_line = lines[i].strip()
                    if desc_line and desc_line != 'service':
                        description_parts.append(desc_line)
                    i += 1
                
                # Skip "Profit Rhino" line
                if i < len(lines) and lines[i].strip() == 'Profit Rhino':
                    i += 1
                
                # Skip empty line after "Profit Rhino"
                while i < len(lines) and not lines[i].strip():
                    i += 1
                
                # Get service code (like T811271)
                service_code = ''
                if i < len(lines):
                    service_code = lines[i].strip()
                    i += 1
                
                # Skip empty line after service code
                while i < len(lines) and not lines[i].strip():
                    i += 1
                
                # Get price (like $323.00)
                price = 0.0
                if i < len(lines):
                    price_line = lines[i].strip()
                    price_match = re.search(r'\$(\d+\.?\d*)', price_line)
                    if price_match:
                        price = float(price_match.group(1))
                    i += 1
                
                # Skip "service" line
                if i < len(lines) and lines[i].strip() == 'service':
                    i += 1
                
                # Create service entry
                if service_name and service_code:
                    service = {
                        'name': service_name,
                        'description': ' '.join(description_parts),
                        'original_code': service_code,
                        'price': price,
                        'labor_hours': 1.0  # Default labor hours
                    }
                    services.append(service)
            else:
                i += 1
    
    except Exception as e:
        print(f"Error parsing file {file_path}: {e}")
    
    return services

def populate_categories():
    """Populate the service categories table"""
    print("Populating service categories...")
    
    for cat_data in ELECTRICAL_CATEGORIES:
        existing = ServiceCategory.query.filter_by(category_code=cat_data['category_code']).first()
        if not existing:
            category = ServiceCategory(**cat_data)
            db.session.add(category)
            print(f"Added category: {cat_data['category_code']} - {cat_data['category_name']}")
    
    db.session.commit()
    print(f"Categories populated: {len(ELECTRICAL_CATEGORIES)} total")

def populate_services():
    """Populate electrical services from flat rate files"""
    print("Populating electrical services from flat rate files...")
    
    # Find all flat rate files
    flat_rate_files = glob.glob('/home/ubuntu/upload/fr*.txt')
    
    if not flat_rate_files:
        print("No flat rate files found in ../upload/")
        return
    
    print(f"Found {len(flat_rate_files)} flat rate files")
    
    # Category counters for EL-XX-XXX coding
    category_counters = {cat['category_code']: 1 for cat in ELECTRICAL_CATEGORIES}
    
    total_services = 0
    
    for file_path in flat_rate_files:
        print(f"Processing {os.path.basename(file_path)}...")
        services = parse_flat_rate_file(file_path)
        
        for service_data in services:
            # Determine category
            category_code = categorize_service(service_data['name'], service_data['description'])
            
            # Get category info
            category = next((cat for cat in ELECTRICAL_CATEGORIES if cat['category_code'] == category_code), None)
            if not category:
                continue
            
            # Generate ServiceBook Pros service code
            service_number = str(category_counters[category_code]).zfill(3)
            service_code = f"{category_code}-{service_number}"
            category_counters[category_code] += 1
            
            # Check if service already exists
            existing = ElectricalService.query.filter_by(service_code=service_code).first()
            if existing:
                continue
            
            # Create new service
            service = ElectricalService(
                service_code=service_code,
                category_code=category_code,
                category_name=category['category_name'],
                service_name=service_data['name'][:200],  # Truncate if too long
                description=service_data['description'][:1000] if service_data['description'] else service_data['name'],
                base_price=Decimal(str(service_data['price'])) if service_data['price'] > 0 else Decimal('75.00'),
                labor_hours=Decimal(str(service_data['labor_hours'])),
                material_cost=Decimal('0.00'),  # Will be calculated separately
                original_code=service_data['original_code']
            )
            
            db.session.add(service)
            total_services += 1
            
            if total_services % 100 == 0:
                print(f"Processed {total_services} services...")
                db.session.commit()
    
    db.session.commit()
    print(f"Services populated: {total_services} total")
    
    # Print category breakdown
    print("\nCategory breakdown:")
    for cat in ELECTRICAL_CATEGORIES:
        count = ElectricalService.query.filter_by(category_code=cat['category_code']).count()
        print(f"  {cat['category_code']}: {count} services - {cat['category_name']}")

def create_default_settings():
    """Create default pricing settings"""
    print("Creating default pricing settings...")
    
    default_settings = PricingSettings(
        contractor_id='default',
        base_labor_rate=Decimal('75.00'),
        markup_percentage=Decimal('15.00'),
        region='Default',
        cost_of_living_multiplier=Decimal('1.00'),
        business_name='ServiceBook Pros Demo',
        license_number='DEMO-001'
    )
    
    existing = PricingSettings.query.filter_by(contractor_id='default').first()
    if not existing:
        db.session.add(default_settings)
        db.session.commit()
        print("Default pricing settings created")
    else:
        print("Default pricing settings already exist")

def main():
    """Main population function"""
    print("ServiceBook Pros Database Population")
    print("=" * 40)
    
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Populate data
        populate_categories()
        populate_services()
        create_default_settings()
        
        # Final statistics
        total_categories = ServiceCategory.query.count()
        total_services = ElectricalService.query.count()
        
        print("\n" + "=" * 40)
        print("Database population complete!")
        print(f"Categories: {total_categories}")
        print(f"Services: {total_services}")
        print("ServiceBook Pros is ready to compete with Profit Rhino and HousecallPro!")

if __name__ == '__main__':
    main()

