#!/usr/bin/env python3
"""
ServiceBook Pros - Subcategory Population Script
Populates subcategories based on HousecallPro's hierarchical structure
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app
from src.models.user import db
from src.models.subcategory import ServiceSubcategory
from src.models.pricing import ElectricalService

def create_subcategories():
    """Create subcategories for better service organization"""
    
    # EL-01: Troubleshooting & Code Repair subcategories
    el01_subcategories = [
        {
            'code': 'EL-01-A',
            'name': 'Safety Inspections',
            'description': 'Electrical safety inspections and assessments',
            'image': '/images/safety_inspections.jpg'
        },
        {
            'code': 'EL-01-B', 
            'name': 'Permits & Inspections',
            'description': 'Permit applications and electrical inspections',
            'image': '/images/permits_inspections.jpg'
        },
        {
            'code': 'EL-01-C',
            'name': 'Circuit Labeling',
            'description': 'Circuit identification and labeling services',
            'image': '/images/circuit_labeling.jpg'
        },
        {
            'code': 'EL-01-D',
            'name': 'Code Violations',
            'description': 'Code violation identification and correction',
            'image': '/images/code_violations.jpg'
        },
        {
            'code': 'EL-01-E',
            'name': 'Troubleshooting',
            'description': 'General electrical troubleshooting and diagnostics',
            'image': '/images/troubleshooting.jpg'
        },
        {
            'code': 'EL-01-F',
            'name': 'Panel Lockouts & Tag',
            'description': 'Panel lockout and tagging procedures',
            'image': '/images/panel_lockouts.jpg'
        },
        {
            'code': 'EL-01-G',
            'name': 'Panel Grounding & Bonding',
            'description': 'Panel grounding and bonding repairs',
            'image': '/images/panel_grounding.jpg'
        },
        {
            'code': 'EL-01-H',
            'name': 'Locate & Mark Cables',
            'description': 'Cable location and marking services',
            'image': '/images/locate_cables.jpg'
        },
        {
            'code': 'EL-01-I',
            'name': 'Watt Meters',
            'description': 'Watt meter installation and testing',
            'image': '/images/watt_meters.jpg'
        },
        {
            'code': 'EL-01-J',
            'name': 'Panel Maintenance',
            'description': 'Electrical panel maintenance and servicing',
            'image': '/images/panel_maintenance.jpg'
        }
    ]
    
    # EL-02: Service Entrances & Upgrades subcategories
    el02_subcategories = [
        {
            'code': 'EL-02-A',
            'name': 'Service Entrance Installation',
            'description': 'New service entrance installation',
            'image': '/images/service_entrance.jpg'
        },
        {
            'code': 'EL-02-B',
            'name': 'Service Upgrades',
            'description': 'Electrical service capacity upgrades',
            'image': '/images/service_upgrades.jpg'
        },
        {
            'code': 'EL-02-C',
            'name': 'Meter Installation',
            'description': 'Electric meter installation and replacement',
            'image': '/images/meter_installation.jpg'
        }
    ]
    
    # EL-03: Panels & Sub Panels subcategories
    el03_subcategories = [
        {
            'code': 'EL-03-A',
            'name': 'Main Panel Installation',
            'description': 'Main electrical panel installation',
            'image': '/images/main_panel.jpg'
        },
        {
            'code': 'EL-03-B',
            'name': 'Sub Panel Installation',
            'description': 'Sub panel installation and wiring',
            'image': '/images/sub_panel.jpg'
        },
        {
            'code': 'EL-03-C',
            'name': 'Panel Upgrades',
            'description': 'Panel capacity and feature upgrades',
            'image': '/images/panel_upgrades.jpg'
        }
    ]
    
    # EL-04: Breakers & Fuses subcategories
    el04_subcategories = [
        {
            'code': 'EL-04-A',
            'name': 'Circuit Breakers',
            'description': 'Circuit breaker installation and replacement',
            'image': '/images/circuit_breakers.jpg'
        },
        {
            'code': 'EL-04-B',
            'name': 'GFCI Breakers',
            'description': 'GFCI breaker installation and testing',
            'image': '/images/gfci_breakers.jpg'
        },
        {
            'code': 'EL-04-C',
            'name': 'AFCI Breakers',
            'description': 'AFCI breaker installation and testing',
            'image': '/images/afci_breakers.jpg'
        },
        {
            'code': 'EL-04-D',
            'name': 'Fuse Replacement',
            'description': 'Fuse box maintenance and replacement',
            'image': '/images/fuse_replacement.jpg'
        }
    ]
    
    # EL-05: Switches & Outlets subcategories
    el05_subcategories = [
        {
            'code': 'EL-05-A',
            'name': 'Standard Outlets',
            'description': 'Standard electrical outlet installation',
            'image': '/images/standard_outlets.jpg'
        },
        {
            'code': 'EL-05-B',
            'name': 'GFCI Outlets',
            'description': 'GFCI outlet installation and testing',
            'image': '/images/gfci_outlets.jpg'
        },
        {
            'code': 'EL-05-C',
            'name': 'USB Outlets',
            'description': 'USB outlet installation and wiring',
            'image': '/images/usb_outlets.jpg'
        },
        {
            'code': 'EL-05-D',
            'name': 'Light Switches',
            'description': 'Light switch installation and replacement',
            'image': '/images/light_switches.jpg'
        },
        {
            'code': 'EL-05-E',
            'name': 'Dimmer Switches',
            'description': 'Dimmer switch installation and wiring',
            'image': '/images/dimmer_switches.jpg'
        }
    ]
    
    # EL-06: Wiring & Circuits subcategories
    el06_subcategories = [
        {
            'code': 'EL-06-A',
            'name': 'New Circuit Installation',
            'description': 'New electrical circuit installation',
            'image': '/images/new_circuits.jpg'
        },
        {
            'code': 'EL-06-B',
            'name': 'Rewiring Services',
            'description': 'Complete rewiring and wire replacement',
            'image': '/images/rewiring.jpg'
        },
        {
            'code': 'EL-06-C',
            'name': '220V Circuits',
            'description': '220V high-voltage circuit installation',
            'image': '/images/220v_circuits.jpg'
        },
        {
            'code': 'EL-06-D',
            'name': 'Dedicated Circuits',
            'description': 'Dedicated circuit installation for appliances',
            'image': '/images/dedicated_circuits.jpg'
        }
    ]
    
    all_subcategories = (
        [(cat, 'EL-01') for cat in el01_subcategories] +
        [(cat, 'EL-02') for cat in el02_subcategories] +
        [(cat, 'EL-03') for cat in el03_subcategories] +
        [(cat, 'EL-04') for cat in el04_subcategories] +
        [(cat, 'EL-05') for cat in el05_subcategories] +
        [(cat, 'EL-06') for cat in el06_subcategories]
    )
    
    print("Creating subcategories...")
    created_count = 0
    
    for subcat_data, parent_code in all_subcategories:
        existing = ServiceSubcategory.query.filter_by(
            subcategory_code=subcat_data['code']
        ).first()
        
        if not existing:
            subcategory = ServiceSubcategory(
                subcategory_code=subcat_data['code'],
                subcategory_name=subcat_data['name'],
                description=subcat_data['description'],
                parent_category_code=parent_code,
                image_url=subcat_data['image'],
                sort_order=created_count + 1
            )
            db.session.add(subcategory)
            created_count += 1
            print(f"Added subcategory: {subcat_data['code']} - {subcat_data['name']}")
    
    db.session.commit()
    print(f"Created {created_count} subcategories")
    return created_count

def assign_services_to_subcategories():
    """Assign existing services to appropriate subcategories based on service names"""
    
    # Define keyword mappings for automatic subcategory assignment
    subcategory_keywords = {
        'EL-01-A': ['safety', 'inspection', 'inspect', 'check'],
        'EL-01-B': ['permit', 'inspection', 'code compliance'],
        'EL-01-C': ['label', 'labeling', 'circuit label', 'trace'],
        'EL-01-D': ['violation', 'code', 'compliance'],
        'EL-01-E': ['troubleshoot', 'diagnose', 'problem', 'issue', 'fault'],
        'EL-01-F': ['lockout', 'tag', 'loto'],
        'EL-01-G': ['ground', 'grounding', 'bond', 'bonding'],
        'EL-01-H': ['locate', 'mark', 'cable', 'wire'],
        'EL-01-I': ['watt', 'meter', 'measurement'],
        'EL-01-J': ['maintenance', 'service', 'clean'],
        
        'EL-02-A': ['service entrance', 'main service'],
        'EL-02-B': ['upgrade', 'increase', 'amp'],
        'EL-02-C': ['meter', 'electric meter'],
        
        'EL-03-A': ['main panel', 'electrical panel'],
        'EL-03-B': ['sub panel', 'subpanel'],
        'EL-03-C': ['panel upgrade', 'replace panel'],
        
        'EL-04-A': ['breaker', 'circuit breaker'],
        'EL-04-B': ['gfci breaker', 'gfi breaker'],
        'EL-04-C': ['afci breaker', 'arc fault'],
        'EL-04-D': ['fuse', 'fuse box'],
        
        'EL-05-A': ['outlet', 'receptacle'],
        'EL-05-B': ['gfci outlet', 'gfi outlet'],
        'EL-05-C': ['usb outlet', 'usb receptacle'],
        'EL-05-D': ['switch', 'light switch'],
        'EL-05-E': ['dimmer', 'dimmer switch'],
        
        'EL-06-A': ['new circuit', 'install circuit'],
        'EL-06-B': ['rewire', 'rewiring', 'replace wire'],
        'EL-06-C': ['220v', '240v', 'high voltage'],
        'EL-06-D': ['dedicated circuit', 'appliance circuit']
    }
    
    print("Assigning services to subcategories...")
    updated_count = 0
    
    # Get all services that need subcategory assignment
    services = ElectricalService.query.filter(
        ElectricalService.category_code.in_(['EL-01', 'EL-02', 'EL-03', 'EL-04', 'EL-05', 'EL-06']),
        ElectricalService.subcategory_code.is_(None)
    ).all()
    
    for service in services:
        service_text = (service.service_name + ' ' + service.description).lower()
        
        # Find best matching subcategory
        best_match = None
        max_matches = 0
        
        for subcat_code, keywords in subcategory_keywords.items():
            if not subcat_code.startswith(service.category_code):
                continue
                
            matches = sum(1 for keyword in keywords if keyword.lower() in service_text)
            if matches > max_matches:
                max_matches = matches
                best_match = subcat_code
        
        # Assign to subcategory if we found a good match
        if best_match and max_matches > 0:
            subcategory = ServiceSubcategory.query.filter_by(
                subcategory_code=best_match
            ).first()
            
            if subcategory:
                service.subcategory_code = best_match
                service.subcategory_name = subcategory.subcategory_name
                updated_count += 1
                
                if updated_count <= 10:  # Show first 10 assignments
                    print(f"Assigned {service.service_code} to {best_match}: {service.service_name[:50]}...")
    
    db.session.commit()
    print(f"Assigned {updated_count} services to subcategories")
    return updated_count

def main():
    """Main function to populate subcategories"""
    with app.app_context():
        print("ServiceBook Pros - Subcategory Population")
        print("=" * 50)
        
        # Create database tables
        db.create_all()
        
        # Create subcategories
        subcategory_count = create_subcategories()
        
        # Assign services to subcategories
        assignment_count = assign_services_to_subcategories()
        
        print("=" * 50)
        print(f"Subcategory population complete!")
        print(f"Created: {subcategory_count} subcategories")
        print(f"Assigned: {assignment_count} services")
        print("ServiceBook Pros now has hierarchical service organization!")

if __name__ == "__main__":
    main()

