"""
Enhanced demo data initialization for ServiceBook Pros
Includes pricing, inventory, and technician data
"""

from src.models.user import db, User
from src.models.company import Company
from src.models.customer import Customer
from src.models.job import Job, JobStatus
from src.models.estimate import Estimate
from src.models.invoice import Invoice
from src.models.pricing import FlatRatePricingItem, PricingTemplate, CompanyPricingSettings
from src.models.inventory import InventoryItem, StockMovement
from src.models.technician import Technician, TechnicianSchedule
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import json

def init_enhanced_demo_data():
    """Initialize comprehensive demo data for all features"""
    
    # Check if data already exists
    if User.query.first():
        print("Demo data already exists, skipping initialization")
        return
    
    try:
        # Create demo company
        company = Company(
            name="ServiceBook Pros Demo",
            address="123 Service Street, Demo City, DC 12345",
            phone="(555) 123-4567",
            email="demo@servicebookpros.com",
            website="https://servicebookpros.com"
        )
        db.session.add(company)
        db.session.flush()
        
        # Create demo users
        admin_user = User(
            username="demo_admin",
            email="admin@servicebookpros.com",
            first_name="Demo",
            last_name="Admin",
            role="admin",
            company_id=company.id,
            password_hash=generate_password_hash("demo123")
        )
        db.session.add(admin_user)
        
        # Create demo technicians
        technicians_data = [
            {
                "first_name": "Mike", "last_name": "Johnson", "employee_id": "TECH001",
                "phone": "(555) 234-5678", "email": "mike@servicebookpros.com",
                "specialties": ["Plumbing", "HVAC"], "hourly_rate": 75.00
            },
            {
                "first_name": "Sarah", "last_name": "Williams", "employee_id": "TECH002", 
                "phone": "(555) 345-6789", "email": "sarah@servicebookpros.com",
                "specialties": ["Electrical", "General Repair"], "hourly_rate": 80.00
            },
            {
                "first_name": "David", "last_name": "Brown", "employee_id": "TECH003",
                "phone": "(555) 456-7890", "email": "david@servicebookpros.com", 
                "specialties": ["HVAC", "Appliance Repair"], "hourly_rate": 70.00
            }
        ]
        
        for tech_data in technicians_data:
            technician = Technician(
                company_id=company.id,
                first_name=tech_data["first_name"],
                last_name=tech_data["last_name"],
                employee_id=tech_data["employee_id"],
                phone=tech_data["phone"],
                email=tech_data["email"],
                specialties=json.dumps(tech_data["specialties"]),
                hourly_rate=tech_data["hourly_rate"],
                status="active"
            )
            db.session.add(technician)
        
        # Create demo customers
        customers_data = [
            {
                "first_name": "John", "last_name": "Meyer", "email": "john.meyer@email.com",
                "phone": "(406) 799-0536", "address": "1251 Golf View Drive",
                "city": "Seeley Lake", "state": "MT", "zip_code": "59868"
            },
            {
                "first_name": "Bruce", "last_name": "Hall", "email": "bruce.hall@email.com",
                "phone": "(406) 677-2345", "address": "270 A Street", 
                "city": "Seeley Lake", "state": "MT", "zip_code": "59868"
            },
            {
                "first_name": "Susan", "last_name": "Scarr", "email": "susan.scarr@email.com",
                "phone": "(406) 728-9876", "address": "916 Grand Ave",
                "city": "Missoula", "state": "MT", "zip_code": "59802"
            }
        ]
        
        for cust_data in customers_data:
            customer = Customer(
                company_id=company.id,
                first_name=cust_data["first_name"],
                last_name=cust_data["last_name"],
                email=cust_data["email"],
                phone=cust_data["phone"],
                address=cust_data["address"],
                city=cust_data["city"],
                state=cust_data["state"],
                zip_code=cust_data["zip_code"],
                customer_type="residential",
                status="active"
            )
            db.session.add(customer)
        
        # Create pricing categories and items
        pricing_categories = [
            {
                "name": "Plumbing Repairs",
                "description": "Standard plumbing repair services",
                "items": [
                    {"name": "Kitchen Sink Leak Repair", "description": "Repair leaking kitchen sink including faucet and pipe connections", "good_price": 125.00, "better_price": 175.00, "best_price": 225.00},
                    {"name": "Toilet Repair", "description": "Complete toilet repair including flapper, chain, and seal replacement", "good_price": 95.00, "better_price": 135.00, "best_price": 185.00},
                    {"name": "Drain Cleaning", "description": "Professional drain cleaning service for bathroom and kitchen drains", "good_price": 85.00, "better_price": 125.00, "best_price": 165.00}
                ]
            },
            {
                "name": "HVAC Services", 
                "description": "Heating and cooling system services",
                "items": [
                    {"name": "Water Heater Service", "description": "Annual water heater maintenance including anode rod inspection and filter replacement", "good_price": 150.00, "better_price": 200.00, "best_price": 275.00},
                    {"name": "Furnace Tune-up", "description": "Complete furnace inspection and tune-up service", "good_price": 125.00, "better_price": 175.00, "best_price": 225.00}
                ]
            }
        ]
        
        for category_data in pricing_categories:
            for item_data in category_data["items"]:
                pricing_item = FlatRatePricingItem(
                    company_id=company.id,
                    category=category_data["name"],
                    name=item_data["name"],
                    description=item_data["description"],
                    good_price=item_data["good_price"],
                    better_price=item_data["better_price"],
                    best_price=item_data["best_price"],
                    labor_hours=2.0,
                    material_cost=25.00
                )
                db.session.add(pricing_item)
        
        # Create inventory items
        inventory_items = [
            {"name": "PVC Pipe Fitting", "category": "Plumbing", "sku": "PVC-001", "cost": 15.99, "price": 25.99, "stock_quantity": 50, "min_stock": 10, "location": "Warehouse A-1"},
            {"name": "Pipe Sealant", "category": "Plumbing", "sku": "SEAL-001", "cost": 8.50, "price": 15.99, "stock_quantity": 25, "min_stock": 5, "location": "Warehouse A-2"},
            {"name": "Water Heater Filter", "category": "HVAC", "sku": "FILTER-001", "cost": 12.00, "price": 22.99, "stock_quantity": 30, "min_stock": 8, "location": "Warehouse B-1"},
            {"name": "Anode Rod", "category": "HVAC", "sku": "ANODE-001", "cost": 25.00, "price": 45.99, "stock_quantity": 15, "min_stock": 3, "location": "Warehouse B-2"},
            {"name": "Drain Snake", "category": "Tools", "sku": "TOOL-001", "cost": 45.00, "price": 75.99, "stock_quantity": 8, "min_stock": 2, "location": "Tool Room"},
            {"name": "Cleaning Solution", "category": "Chemicals", "sku": "CHEM-001", "cost": 6.99, "price": 12.99, "stock_quantity": 40, "min_stock": 10, "location": "Chemical Storage"}
        ]
        
        for item_data in inventory_items:
            inventory_item = InventoryItem(
                company_id=company.id,
                name=item_data["name"],
                category=item_data["category"],
                sku=item_data["sku"],
                cost=item_data["cost"],
                price=item_data["price"],
                stock_quantity=item_data["stock_quantity"],
                min_stock_level=item_data["min_stock"],
                location=item_data["location"],
                supplier="Demo Supplier Inc."
            )
            db.session.add(inventory_item)
        
        # Create demo jobs
        db.session.flush()  # Flush to get IDs
        
        customers = Customer.query.all()
        technicians = Technician.query.all()
        
        if customers and technicians:
            jobs_data = [
                {
                    "customer": customers[0], "technician": technicians[0],
                    "title": "Kitchen Sink Leak Repair", "description": "Customer reports leaking kitchen sink",
                    "scheduled_date": datetime.now() + timedelta(hours=2),
                    "estimated_duration": 2.0, "priority": "high"
                },
                {
                    "customer": customers[1], "technician": technicians[0], 
                    "title": "Water Heater Service", "description": "Annual maintenance check",
                    "scheduled_date": datetime.now() + timedelta(hours=5),
                    "estimated_duration": 1.5, "priority": "normal"
                },
                {
                    "customer": customers[2], "technician": technicians[1],
                    "title": "Drain Cleaning", "description": "Bathroom drain clog",
                    "scheduled_date": datetime.now() + timedelta(hours=7),
                    "estimated_duration": 1.0, "priority": "normal"
                }
            ]
            
            for job_data in jobs_data:
                job = Job(
                    company_id=company.id,
                    customer_id=job_data["customer"].id,
                    technician_id=job_data["technician"].id,
                    title=job_data["title"],
                    description=job_data["description"],
                    scheduled_date=job_data["scheduled_date"],
                    estimated_duration=job_data["estimated_duration"],
                    priority=job_data["priority"],
                    status=JobStatus.SCHEDULED
                )
                db.session.add(job)
        
        # Create company pricing settings
        pricing_settings = CompanyPricingSettings(
            company_id=company.id,
            base_labor_rate=75.00,
            markup_percentage=50.0,
            tax_rate=8.5,
            default_tier="better"
        )
        db.session.add(pricing_settings)
        
        db.session.commit()
        print("Enhanced demo data initialized successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing enhanced demo data: {e}")
        raise e

