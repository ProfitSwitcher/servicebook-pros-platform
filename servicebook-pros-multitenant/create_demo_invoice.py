#!/usr/bin/env python3
"""
Create demo invoice data for PDF testing
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask
from src.models.user import db
from src.models.invoice import Invoice, InvoiceLineItem, Customer
from src.models.company import Company
from datetime import datetime, date

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///servicebook_pros.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    # Create all tables
    db.create_all()
    
    # Initialize demo data if needed
    from init_demo_data import init_demo_data
    try:
        init_demo_data()
        print("Demo data initialized")
    except Exception as e:
        print(f"Demo data already exists or error: {e}")
    
    # Create demo invoice for testing
    company = Company.query.filter_by(company_name='Demo Company').first()
    if company:
        # Check if customer already exists
        existing_customer = Customer.query.filter_by(
            company_id=company.id, 
            email='john.doe@example.com'
        ).first()
        
        if not existing_customer:
            # Create a test customer
            customer = Customer(
                company_id=company.id,
                first_name='John',
                last_name='Doe',
                email='john.doe@example.com',
                phone='555-123-4567',
                address='123 Main St',
                city='Anytown',
                state='CA',
                zip_code='12345'
            )
            db.session.add(customer)
            db.session.flush()
        else:
            customer = existing_customer
        
        # Check if invoice already exists
        existing_invoice = Invoice.query.filter_by(
            company_id=company.id,
            invoice_number='INV-001'
        ).first()
        
        if not existing_invoice:
            # Create a test invoice
            invoice = Invoice(
                company_id=company.id,
                customer_id=customer.id,
                invoice_number='INV-001',
                invoice_date=date.today(),
                due_date=date.today(),
                status='draft',
                subtotal=100.00,
                tax_amount=8.75,
                total_amount=108.75,
                payment_terms='Net 30',
                notes='Test invoice for PDF generation'
            )
            db.session.add(invoice)
            db.session.flush()
            
            # Add line items
            line_item1 = InvoiceLineItem(
                invoice_id=invoice.id,
                description='Service Call - Plumbing Repair',
                quantity=1,
                unit_price=75.00,
                total_price=75.00
            )
            
            line_item2 = InvoiceLineItem(
                invoice_id=invoice.id,
                description='Parts - Pipe Fittings',
                quantity=2,
                unit_price=12.50,
                total_price=25.00
            )
            
            db.session.add(line_item1)
            db.session.add(line_item2)
            db.session.commit()
            
            print(f'Created test invoice with ID: {invoice.id}')
        else:
            print(f'Test invoice already exists with ID: {existing_invoice.id}')
    else:
        print('Demo company not found')

