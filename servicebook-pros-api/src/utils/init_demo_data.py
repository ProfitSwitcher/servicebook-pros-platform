from src.models.user import db, User
from src.models.company import Company
from src.models.customer import Customer
from werkzeug.security import generate_password_hash

def init_demo_data():
    """Initialize demo data if no companies exist"""
    
    if Company.query.count() == 0:
        # Create demo company
        demo_company = Company(
            name="Demo Service Company",
            address="123 Main St, Demo City, CA 12345",
            phone="(555) 123-4567",
            email="demo@servicebookpros.com"
        )
        db.session.add(demo_company)
        db.session.flush()
        
        # Create demo admin user
        demo_user = User(
            company_id=demo_company.id,
            username="demo_admin",
            email="admin@demo.com",
            password_hash=generate_password_hash("demo123"),
            first_name="Demo",
            last_name="Admin",
            role="admin",
            is_active=True
        )
        db.session.add(demo_user)
        
        # Create demo customers
        demo_customers = [
            Customer(
                company_id=demo_company.id,
                first_name="John",
                last_name="Meyer",
                email="john.meyer@email.com",
                phone="(406) 799-0536",
                address="1251 Golf View Drive",
                city="Seeley Lake",
                state="MT",
                zip_code="59868",
                customer_type="residential",
                status="active"
            ),
            Customer(
                company_id=demo_company.id,
                first_name="Bruce",
                last_name="Hall",
                email="bruce.hall@email.com",
                phone="(406) 799-0537",
                address="270 A Street",
                city="Seeley Lake",
                state="MT",
                zip_code="59868",
                customer_type="residential",
                status="active"
            ),
            Customer(
                company_id=demo_company.id,
                first_name="Susan",
                last_name="Scarr",
                email="susan.scarr@email.com",
                phone="(406) 799-0538",
                address="916 Grand Ave",
                city="Missoula",
                state="MT",
                zip_code="59802",
                customer_type="residential",
                status="active"
            ),
            Customer(
                company_id=demo_company.id,
                first_name="Michael",
                last_name="Pritchard",
                email="michael.pritchard@email.com",
                phone="(406) 799-0539",
                address="5855 La Voie Ln",
                city="Missoula",
                state="MT",
                zip_code="59808",
                customer_type="commercial",
                status="active"
            ),
            Customer(
                company_id=demo_company.id,
                first_name="Nathan",
                last_name="Winter",
                email="nathan.winter@email.com",
                phone="(904) 801-9219",
                address="3071 Double Arrow Lookout Road",
                city="Seeley Lake",
                state="MT",
                zip_code="59868",
                customer_type="residential",
                status="prospect"
            )
        ]
        
        for customer in demo_customers:
            db.session.add(customer)
        
        db.session.commit()
        print("Demo data created successfully!")

