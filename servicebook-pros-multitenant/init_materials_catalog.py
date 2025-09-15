#!/usr/bin/env python3
"""
Initialize materials catalog for ServiceBook Pros
Populates plumbing and HVAC materials
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask
from src.models.user import db
from src.models.company import Company
from src.models.materials import MaterialCategory, MaterialSubcategory, MasterMaterial

def init_materials_catalog():
    """Initialize materials catalog with plumbing and HVAC materials"""
    
    print("Initializing materials catalog...")
    
    # Create material categories
    categories = [
        {
            'category_code': 'PLB',
            'category_name': 'Plumbing',
            'description': 'Plumbing materials including pipes, fittings, fixtures, and accessories'
        },
        {
            'category_code': 'HVAC',
            'category_name': 'HVAC',
            'description': 'Heating, ventilation, and air conditioning materials'
        },
        {
            'category_code': 'EL',
            'category_name': 'Electrical',
            'description': 'Electrical materials including wiring, outlets, switches, and fixtures'
        }
    ]
    
    for cat_data in categories:
        existing_cat = MaterialCategory.query.filter_by(category_code=cat_data['category_code']).first()
        if not existing_cat:
            category = MaterialCategory(**cat_data)
            db.session.add(category)
    
    # Create plumbing subcategories
    plumbing_subcategories = [
        {'category_code': 'PLB', 'subcategory_code': 'PLB-PIPE', 'subcategory_name': 'Pipes & Tubing', 'description': 'Various types of pipes and tubing'},
        {'category_code': 'PLB', 'subcategory_code': 'PLB-FIT', 'subcategory_name': 'Fittings', 'description': 'Pipe fittings and connectors'},
        {'category_code': 'PLB', 'subcategory_code': 'PLB-VALVE', 'subcategory_name': 'Valves', 'description': 'Various types of valves'},
        {'category_code': 'PLB', 'subcategory_code': 'PLB-FIX', 'subcategory_name': 'Fixtures', 'description': 'Plumbing fixtures'},
        {'category_code': 'PLB', 'subcategory_code': 'PLB-DRAIN', 'subcategory_name': 'Drainage', 'description': 'Drainage components'},
        {'category_code': 'PLB', 'subcategory_code': 'PLB-WATER', 'subcategory_name': 'Water Heaters', 'description': 'Water heating equipment'},
    ]
    
    # Create HVAC subcategories
    hvac_subcategories = [
        {'category_code': 'HVAC', 'subcategory_code': 'HVAC-DUCT', 'subcategory_name': 'Ductwork', 'description': 'Ductwork and accessories'},
        {'category_code': 'HVAC', 'subcategory_code': 'HVAC-VENT', 'subcategory_name': 'Vents & Grilles', 'description': 'Air vents and grilles'},
        {'category_code': 'HVAC', 'subcategory_code': 'HVAC-UNIT', 'subcategory_name': 'Units & Equipment', 'description': 'HVAC units and equipment'},
        {'category_code': 'HVAC', 'subcategory_code': 'HVAC-FILTER', 'subcategory_name': 'Filters', 'description': 'Air filters and accessories'},
        {'category_code': 'HVAC', 'subcategory_code': 'HVAC-THERM', 'subcategory_name': 'Thermostats', 'description': 'Thermostats and controls'},
        {'category_code': 'HVAC', 'subcategory_code': 'HVAC-REF', 'subcategory_name': 'Refrigerant', 'description': 'Refrigerant and related materials'},
    ]
    
    for subcat_data in plumbing_subcategories + hvac_subcategories:
        existing_subcat = MaterialSubcategory.query.filter_by(subcategory_code=subcat_data['subcategory_code']).first()
        if not existing_subcat:
            subcategory = MaterialSubcategory(**subcat_data)
            db.session.add(subcategory)
    
    # Plumbing materials
    plumbing_materials = [
        # Pipes & Tubing
        {'material_code': 'PLB-PIPE-001', 'material_name': '1/2" Copper Pipe Type L', 'category_code': 'PLB', 'subcategory_code': 'PLB-PIPE', 'unit_of_measure': 'ft', 'base_cost': 3.25, 'description': '1/2 inch copper pipe, Type L'},
        {'material_code': 'PLB-PIPE-002', 'material_name': '3/4" Copper Pipe Type L', 'category_code': 'PLB', 'subcategory_code': 'PLB-PIPE', 'unit_of_measure': 'ft', 'base_cost': 4.75, 'description': '3/4 inch copper pipe, Type L'},
        {'material_code': 'PLB-PIPE-003', 'material_name': '1" Copper Pipe Type L', 'category_code': 'PLB', 'subcategory_code': 'PLB-PIPE', 'unit_of_measure': 'ft', 'base_cost': 7.50, 'description': '1 inch copper pipe, Type L'},
        {'material_code': 'PLB-PIPE-004', 'material_name': '1/2" PEX Tubing', 'category_code': 'PLB', 'subcategory_code': 'PLB-PIPE', 'unit_of_measure': 'ft', 'base_cost': 0.85, 'description': '1/2 inch PEX tubing'},
        {'material_code': 'PLB-PIPE-005', 'material_name': '3/4" PEX Tubing', 'category_code': 'PLB', 'subcategory_code': 'PLB-PIPE', 'unit_of_measure': 'ft', 'base_cost': 1.25, 'description': '3/4 inch PEX tubing'},
        {'material_code': 'PLB-PIPE-006', 'material_name': '4" PVC Drain Pipe', 'category_code': 'PLB', 'subcategory_code': 'PLB-PIPE', 'unit_of_measure': 'ft', 'base_cost': 4.50, 'description': '4 inch PVC drain pipe'},
        
        # Fittings
        {'material_code': 'PLB-FIT-001', 'material_name': '1/2" Copper 90° Elbow', 'category_code': 'PLB', 'subcategory_code': 'PLB-FIT', 'unit_of_measure': 'each', 'base_cost': 2.25, 'description': '1/2 inch copper 90 degree elbow'},
        {'material_code': 'PLB-FIT-002', 'material_name': '3/4" Copper 90° Elbow', 'category_code': 'PLB', 'subcategory_code': 'PLB-FIT', 'unit_of_measure': 'each', 'base_cost': 3.50, 'description': '3/4 inch copper 90 degree elbow'},
        {'material_code': 'PLB-FIT-003', 'material_name': '1/2" Copper Tee', 'category_code': 'PLB', 'subcategory_code': 'PLB-FIT', 'unit_of_measure': 'each', 'base_cost': 3.75, 'description': '1/2 inch copper tee fitting'},
        {'material_code': 'PLB-FIT-004', 'material_name': '1/2" PEX Coupling', 'category_code': 'PLB', 'subcategory_code': 'PLB-FIT', 'unit_of_measure': 'each', 'base_cost': 1.50, 'description': '1/2 inch PEX coupling'},
        {'material_code': 'PLB-FIT-005', 'material_name': '3/4" PEX Elbow', 'category_code': 'PLB', 'subcategory_code': 'PLB-FIT', 'unit_of_measure': 'each', 'base_cost': 2.25, 'description': '3/4 inch PEX elbow fitting'},
        
        # Valves
        {'material_code': 'PLB-VALVE-001', 'material_name': '1/2" Ball Valve', 'category_code': 'PLB', 'subcategory_code': 'PLB-VALVE', 'unit_of_measure': 'each', 'base_cost': 12.50, 'description': '1/2 inch ball valve'},
        {'material_code': 'PLB-VALVE-002', 'material_name': '3/4" Ball Valve', 'category_code': 'PLB', 'subcategory_code': 'PLB-VALVE', 'unit_of_measure': 'each', 'base_cost': 18.75, 'description': '3/4 inch ball valve'},
        {'material_code': 'PLB-VALVE-003', 'material_name': 'Water Shut-off Valve', 'category_code': 'PLB', 'subcategory_code': 'PLB-VALVE', 'unit_of_measure': 'each', 'base_cost': 25.00, 'description': 'Main water shut-off valve'},
        {'material_code': 'PLB-VALVE-004', 'material_name': 'Pressure Relief Valve', 'category_code': 'PLB', 'subcategory_code': 'PLB-VALVE', 'unit_of_measure': 'each', 'base_cost': 35.00, 'description': 'Water heater pressure relief valve'},
        
        # Fixtures
        {'material_code': 'PLB-FIX-001', 'material_name': 'Kitchen Sink Faucet', 'category_code': 'PLB', 'subcategory_code': 'PLB-FIX', 'unit_of_measure': 'each', 'base_cost': 125.00, 'description': 'Standard kitchen sink faucet'},
        {'material_code': 'PLB-FIX-002', 'material_name': 'Bathroom Sink Faucet', 'category_code': 'PLB', 'subcategory_code': 'PLB-FIX', 'unit_of_measure': 'each', 'base_cost': 85.00, 'description': 'Standard bathroom sink faucet'},
        {'material_code': 'PLB-FIX-003', 'material_name': 'Toilet', 'category_code': 'PLB', 'subcategory_code': 'PLB-FIX', 'unit_of_measure': 'each', 'base_cost': 185.00, 'description': 'Standard toilet'},
        {'material_code': 'PLB-FIX-004', 'material_name': 'Shower Head', 'category_code': 'PLB', 'subcategory_code': 'PLB-FIX', 'unit_of_measure': 'each', 'base_cost': 45.00, 'description': 'Standard shower head'},
        
        # Water Heaters
        {'material_code': 'PLB-WATER-001', 'material_name': '40 Gallon Gas Water Heater', 'category_code': 'PLB', 'subcategory_code': 'PLB-WATER', 'unit_of_measure': 'each', 'base_cost': 650.00, 'description': '40 gallon gas water heater'},
        {'material_code': 'PLB-WATER-002', 'material_name': '50 Gallon Electric Water Heater', 'category_code': 'PLB', 'subcategory_code': 'PLB-WATER', 'unit_of_measure': 'each', 'base_cost': 750.00, 'description': '50 gallon electric water heater'},
        {'material_code': 'PLB-WATER-003', 'material_name': 'Tankless Gas Water Heater', 'category_code': 'PLB', 'subcategory_code': 'PLB-WATER', 'unit_of_measure': 'each', 'base_cost': 1250.00, 'description': 'Tankless gas water heater'},
    ]
    
    # HVAC materials
    hvac_materials = [
        # Ductwork
        {'material_code': 'HVAC-DUCT-001', 'material_name': '6" Round Duct', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-DUCT', 'unit_of_measure': 'ft', 'base_cost': 8.50, 'description': '6 inch round galvanized duct'},
        {'material_code': 'HVAC-DUCT-002', 'material_name': '8" Round Duct', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-DUCT', 'unit_of_measure': 'ft', 'base_cost': 12.75, 'description': '8 inch round galvanized duct'},
        {'material_code': 'HVAC-DUCT-003', 'material_name': '10" Round Duct', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-DUCT', 'unit_of_measure': 'ft', 'base_cost': 16.25, 'description': '10 inch round galvanized duct'},
        {'material_code': 'HVAC-DUCT-004', 'material_name': 'Flexible Duct 6"', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-DUCT', 'unit_of_measure': 'ft', 'base_cost': 4.25, 'description': '6 inch flexible insulated duct'},
        {'material_code': 'HVAC-DUCT-005', 'material_name': 'Duct Elbow 90°', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-DUCT', 'unit_of_measure': 'each', 'base_cost': 15.50, 'description': '90 degree duct elbow'},
        
        # Vents & Grilles
        {'material_code': 'HVAC-VENT-001', 'material_name': '4"x10" Floor Register', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-VENT', 'unit_of_measure': 'each', 'base_cost': 18.50, 'description': '4x10 inch floor register'},
        {'material_code': 'HVAC-VENT-002', 'material_name': '6"x10" Floor Register', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-VENT', 'unit_of_measure': 'each', 'base_cost': 22.75, 'description': '6x10 inch floor register'},
        {'material_code': 'HVAC-VENT-003', 'material_name': '4"x12" Wall Register', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-VENT', 'unit_of_measure': 'each', 'base_cost': 16.25, 'description': '4x12 inch wall register'},
        {'material_code': 'HVAC-VENT-004', 'material_name': '24"x24" Return Air Grille', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-VENT', 'unit_of_measure': 'each', 'base_cost': 45.00, 'description': '24x24 inch return air grille'},
        
        # Units & Equipment
        {'material_code': 'HVAC-UNIT-001', 'material_name': '3 Ton AC Condenser Unit', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-UNIT', 'unit_of_measure': 'each', 'base_cost': 1850.00, 'description': '3 ton air conditioning condenser unit'},
        {'material_code': 'HVAC-UNIT-002', 'material_name': '4 Ton AC Condenser Unit', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-UNIT', 'unit_of_measure': 'each', 'base_cost': 2250.00, 'description': '4 ton air conditioning condenser unit'},
        {'material_code': 'HVAC-UNIT-003', 'material_name': 'Gas Furnace 80K BTU', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-UNIT', 'unit_of_measure': 'each', 'base_cost': 1650.00, 'description': '80,000 BTU gas furnace'},
        {'material_code': 'HVAC-UNIT-004', 'material_name': 'Heat Pump 3 Ton', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-UNIT', 'unit_of_measure': 'each', 'base_cost': 2850.00, 'description': '3 ton heat pump system'},
        
        # Filters
        {'material_code': 'HVAC-FILTER-001', 'material_name': '16"x20"x1" Air Filter', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-FILTER', 'unit_of_measure': 'each', 'base_cost': 8.50, 'description': '16x20x1 inch pleated air filter'},
        {'material_code': 'HVAC-FILTER-002', 'material_name': '20"x25"x1" Air Filter', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-FILTER', 'unit_of_measure': 'each', 'base_cost': 12.75, 'description': '20x25x1 inch pleated air filter'},
        {'material_code': 'HVAC-FILTER-003', 'material_name': 'HEPA Filter 16"x20"', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-FILTER', 'unit_of_measure': 'each', 'base_cost': 35.00, 'description': '16x20 inch HEPA air filter'},
        
        # Thermostats
        {'material_code': 'HVAC-THERM-001', 'material_name': 'Programmable Thermostat', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-THERM', 'unit_of_measure': 'each', 'base_cost': 125.00, 'description': '7-day programmable thermostat'},
        {'material_code': 'HVAC-THERM-002', 'material_name': 'Smart WiFi Thermostat', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-THERM', 'unit_of_measure': 'each', 'base_cost': 285.00, 'description': 'Smart WiFi-enabled thermostat'},
        {'material_code': 'HVAC-THERM-003', 'material_name': 'Basic Manual Thermostat', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-THERM', 'unit_of_measure': 'each', 'base_cost': 45.00, 'description': 'Basic manual thermostat'},
        
        # Refrigerant
        {'material_code': 'HVAC-REF-001', 'material_name': 'R-410A Refrigerant', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-REF', 'unit_of_measure': 'lb', 'base_cost': 15.50, 'description': 'R-410A refrigerant per pound'},
        {'material_code': 'HVAC-REF-002', 'material_name': 'R-22 Refrigerant', 'category_code': 'HVAC', 'subcategory_code': 'HVAC-REF', 'unit_of_measure': 'lb', 'base_cost': 25.00, 'description': 'R-22 refrigerant per pound'},
    ]
    
    # Add all materials
    all_materials = plumbing_materials + hvac_materials
    
    for material_data in all_materials:
        existing_material = MasterMaterial.query.filter_by(material_code=material_data['material_code']).first()
        if not existing_material:
            material = MasterMaterial(**material_data)
            db.session.add(material)
    
    try:
        db.session.commit()
        print(f"✅ Materials catalog initialized successfully!")
        print(f"Added {len(categories)} categories")
        print(f"Added {len(plumbing_subcategories + hvac_subcategories)} subcategories")
        print(f"Added {len(all_materials)} materials")
        print("Categories: Plumbing, HVAC, Electrical")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error initializing materials catalog: {e}")
        raise

if __name__ == '__main__':
    # Create Flask app context
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        init_materials_catalog()

