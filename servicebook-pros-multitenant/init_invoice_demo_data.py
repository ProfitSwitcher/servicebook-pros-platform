#!/usr/bin/env python3
"""
Initialize demo invoice data for ServiceBook Pros
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.models.user import db
from src.models.company import Company
from src.models.invoice import Customer, WorkOrder, Invoice, InvoiceLineItem, Payment
from datetime import datetime, date, timedelta
from decimal import Decimal

def init_invoice_demo_data():
    """Initialize demo invoice data"""
    
    # Get demo companies
    demo_company = Company.query.filter_by(company_code='DEMO').first()
    miami_company = Company.query.filter_by(company_code='MIAMI').first()
    
    if not demo_company or not miami_company:
        print("Demo companies not found. Please run init_demo_data.py first.")
        return
    
    # Create demo customers for Demo Company
    demo_customers = [
        {
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john.smith@email.com',
            'phone': '(555) 123-4567',
            'address': '123 Main St',
            'city': 'Anytown',
            'state': 'CA',
            'zip_code': '90210',
            'preferred_payment_terms': 'Net 30'
        },
        {
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'email': 'sarah.johnson@email.com',
            'phone': '(555) 234-5678',
            'address': '456 Oak Ave',
            'city': 'Somewhere',
            'state': 'CA',
            'zip_code': '90211',
            'preferred_payment_terms': 'Net 15'
        },
        {
            'first_name': 'Mike',
            'last_name': 'Davis',
            'email': 'mike.davis@email.com',
            'phone': '(555) 345-6789',
            'address': '789 Pine Rd',
            'city': 'Elsewhere',
            'state': 'CA',
            'zip_code': '90212',
            'preferred_payment_terms': 'Due on Receipt'
        }
    ]
    
    # Create demo customers for Miami Company
    miami_customers = [
        {
            'first_name': 'Carlos',
            'last_name': 'Rodriguez',
            'email': 'carlos.rodriguez@email.com',
            'phone': '(305) 123-4567',
            'address': '100 Ocean Dr',
            'city': 'Miami',
            'state': 'FL',
            'zip_code': '33139',
            'preferred_payment_terms': 'Net 30'
        },
        {
            'first_name': 'Maria',
            'last_name': 'Garcia',
            'email': 'maria.garcia@email.com',
            'phone': '(305) 234-5678',
            'address': '200 Collins Ave',
            'city': 'Miami Beach',
            'state': 'FL',
            'zip_code': '33140',
            'preferred_payment_terms': 'Net 15'
        }
    ]
    
    created_customers = []
    
    # Create customers for demo company
    for customer_data in demo_customers:
        existing = Customer.query.filter_by(
            company_id=demo_company.id,
            email=customer_data['email']
        ).first()
        
        if not existing:
            customer = Customer(
                company_id=demo_company.id,
                **customer_data
            )
            db.session.add(customer)
            created_customers.append(customer)
    
    # Create customers for miami company
    for customer_data in miami_customers:
        existing = Customer.query.filter_by(
            company_id=miami_company.id,
            email=customer_data['email']
        ).first()
        
        if not existing:
            customer = Customer(
                company_id=miami_company.id,
                **customer_data
            )
            db.session.add(customer)
            created_customers.append(customer)
    
    db.session.flush()  # Get customer IDs
    
    # Create demo work orders
    demo_work_orders = [
        {
            'company_id': demo_company.id,
            'customer_id': created_customers[0].id if created_customers else 1,
            'work_order_number': 'WO-2025-001',
            'description': 'Kitchen electrical outlet installation',
            'status': 'completed',
            'scheduled_date': date.today() - timedelta(days=7),
            'completion_date': date.today() - timedelta(days=5),
            'estimated_hours': Decimal('4.0'),
            'actual_hours': Decimal('3.5')
        },
        {
            'company_id': demo_company.id,
            'customer_id': created_customers[1].id if len(created_customers) > 1 else 1,
            'work_order_number': 'WO-2025-002',
            'description': 'HVAC system maintenance',
            'status': 'completed',
            'scheduled_date': date.today() - timedelta(days=10),
            'completion_date': date.today() - timedelta(days=8),
            'estimated_hours': Decimal('2.0'),
            'actual_hours': Decimal('2.5')
        }
    ]
    
    created_work_orders = []
    for wo_data in demo_work_orders:
        existing = WorkOrder.query.filter_by(
            work_order_number=wo_data['work_order_number']
        ).first()
        
        if not existing:
            work_order = WorkOrder(**wo_data)
            db.session.add(work_order)
            created_work_orders.append(work_order)
    
    db.session.flush()  # Get work order IDs
    
    # Create demo invoices
    demo_invoices = [
        {
            'company_id': demo_company.id,
            'customer_id': created_customers[0].id if created_customers else 1,
            'work_order_id': created_work_orders[0].id if created_work_orders else None,
            'invoice_number': 'INV-2025-000001',
            'date_issued': date.today() - timedelta(days=5),
            'due_date': date.today() + timedelta(days=25),
            'status': 'sent',
            'payment_terms': 'Net 30',
            'notes': 'Kitchen electrical work completed as requested.',
            'tax_rate': demo_company.default_tax_rate
        },
        {
            'company_id': demo_company.id,
            'customer_id': created_customers[1].id if len(created_customers) > 1 else 1,
            'work_order_id': created_work_orders[1].id if len(created_work_orders) > 1 else None,
            'invoice_number': 'INV-2025-000002',
            'date_issued': date.today() - timedelta(days=3),
            'due_date': date.today() + timedelta(days=12),
            'status': 'sent',
            'payment_terms': 'Net 15',
            'notes': 'HVAC maintenance service completed.',
            'tax_rate': demo_company.default_tax_rate
        },
        {
            'company_id': demo_company.id,
            'customer_id': created_customers[2].id if len(created_customers) > 2 else 1,
            'invoice_number': 'INV-2025-000003',
            'date_issued': date.today() - timedelta(days=1),
            'due_date': date.today(),
            'status': 'paid',
            'payment_terms': 'Due on Receipt',
            'notes': 'Emergency plumbing repair.',
            'tax_rate': demo_company.default_tax_rate
        },
        {
            'company_id': miami_company.id,
            'customer_id': created_customers[3].id if len(created_customers) > 3 else 1,
            'invoice_number': 'INV-2025-000001',
            'date_issued': date.today() - timedelta(days=4),
            'due_date': date.today() + timedelta(days=26),
            'status': 'sent',
            'payment_terms': 'Net 30',
            'notes': 'Pool equipment electrical installation.',
            'tax_rate': miami_company.default_tax_rate
        }
    ]
    
    created_invoices = []
    for invoice_data in demo_invoices:
        existing = Invoice.query.filter_by(
            company_id=invoice_data['company_id'],
            invoice_number=invoice_data['invoice_number']
        ).first()
        
        if not existing:
            invoice = Invoice(**invoice_data)
            db.session.add(invoice)
            created_invoices.append(invoice)
    
    db.session.flush()  # Get invoice IDs
    
    # Create demo line items
    demo_line_items = [
        # Invoice 1 - Kitchen electrical work
        [
            {
                'line_number': 1,
                'description': 'Install GFCI outlet in kitchen',
                'quantity': Decimal('2.0'),
                'unit_price': Decimal('85.00'),
                'item_type': 'service'
            },
            {
                'line_number': 2,
                'description': 'GFCI outlet (20A)',
                'quantity': Decimal('2.0'),
                'unit_price': Decimal('25.00'),
                'item_type': 'material'
            },
            {
                'line_number': 3,
                'description': 'Electrical labor',
                'quantity': Decimal('3.5'),
                'unit_price': demo_company.default_labor_rate,
                'item_type': 'labor'
            }
        ],
        # Invoice 2 - HVAC maintenance
        [
            {
                'line_number': 1,
                'description': 'HVAC system inspection and cleaning',
                'quantity': Decimal('1.0'),
                'unit_price': Decimal('150.00'),
                'item_type': 'service'
            },
            {
                'line_number': 2,
                'description': 'Air filter replacement',
                'quantity': Decimal('2.0'),
                'unit_price': Decimal('15.00'),
                'item_type': 'material'
            },
            {
                'line_number': 3,
                'description': 'HVAC technician labor',
                'quantity': Decimal('2.5'),
                'unit_price': demo_company.default_labor_rate,
                'item_type': 'labor'
            }
        ],
        # Invoice 3 - Emergency plumbing
        [
            {
                'line_number': 1,
                'description': 'Emergency plumbing repair - pipe leak',
                'quantity': Decimal('1.0'),
                'unit_price': Decimal('200.00'),
                'item_type': 'service'
            },
            {
                'line_number': 2,
                'description': 'Copper pipe fittings',
                'quantity': Decimal('3.0'),
                'unit_price': Decimal('12.00'),
                'item_type': 'material'
            }
        ],
        # Invoice 4 - Miami pool electrical
        [
            {
                'line_number': 1,
                'description': 'Pool equipment electrical installation',
                'quantity': Decimal('1.0'),
                'unit_price': Decimal('350.00'),
                'item_type': 'service'
            },
            {
                'line_number': 2,
                'description': 'GFCI breaker (30A)',
                'quantity': Decimal('1.0'),
                'unit_price': Decimal('45.00'),
                'item_type': 'material'
            },
            {
                'line_number': 3,
                'description': 'Electrical conduit and wire',
                'quantity': Decimal('50.0'),
                'unit_price': Decimal('2.50'),
                'item_type': 'material'
            }
        ]
    ]
    
    # Create line items for each invoice
    for i, invoice in enumerate(created_invoices):
        if i < len(demo_line_items):
            for item_data in demo_line_items[i]:
                line_item = InvoiceLineItem(
                    invoice_id=invoice.id,
                    **item_data
                )
                line_item.calculate_total()
                db.session.add(line_item)
    
    db.session.flush()
    
    # Calculate invoice totals
    for invoice in created_invoices:
        invoice.calculate_totals()
    
    # Create demo payments for paid invoice
    if len(created_invoices) >= 3:
        paid_invoice = created_invoices[2]  # The "paid" invoice
        payment = Payment(
            invoice_id=paid_invoice.id,
            amount=paid_invoice.total_amount,
            payment_date=date.today() - timedelta(days=1),
            payment_method='check',
            reference_number='CHK-001234',
            notes='Payment received in full'
        )
        db.session.add(payment)
    
    try:
        db.session.commit()
        print("Demo invoice data initialized successfully!")
        print(f"Created {len(created_customers)} customers")
        print(f"Created {len(created_work_orders)} work orders")
        print(f"Created {len(created_invoices)} invoices")
        
        # Print invoice summary
        for invoice in created_invoices:
            print(f"  - {invoice.invoice_number}: ${invoice.total_amount} ({invoice.status})")
            
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing demo invoice data: {e}")
        raise

if __name__ == '__main__':
    from flask import Flask
    from src.models.user import db
    
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        init_invoice_demo_data()

