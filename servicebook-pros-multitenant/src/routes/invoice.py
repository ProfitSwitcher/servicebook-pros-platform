from flask import Blueprint, request, jsonify, send_file
from src.models.user import db
from src.models.invoice import Invoice, InvoiceLineItem, Payment, Customer, WorkOrder, InvoiceTemplate
from src.models.company import Company
from src.routes.auth import require_auth, get_current_company
from datetime import datetime, date, timedelta
from sqlalchemy import and_, or_, desc, asc
from sqlalchemy.orm import joinedload
import io
import json

invoice_bp = Blueprint('invoice', __name__)

# Helper function to generate invoice number
def generate_invoice_number(company_id):
    """Generate a unique invoice number for the company"""
    current_year = datetime.now().year
    
    # Get the last invoice number for this company and year
    last_invoice = db.session.query(Invoice).filter(
        and_(
            Invoice.company_id == company_id,
            Invoice.invoice_number.like(f'INV-{current_year}-%')
        )
    ).order_by(desc(Invoice.id)).first()
    
    if last_invoice:
        # Extract the sequence number and increment
        try:
            last_seq = int(last_invoice.invoice_number.split('-')[-1])
            next_seq = last_seq + 1
        except (ValueError, IndexError):
            next_seq = 1
    else:
        next_seq = 1
    
    return f'INV-{current_year}-{next_seq:06d}'

# Invoice CRUD Operations

@invoice_bp.route('/api/invoices', methods=['GET'])
@require_auth
def get_invoices():
    """Get list of invoices with filtering and pagination"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'error': 'User not associated with any company'}), 403
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        status = request.args.get('status')
        customer_id = request.args.get('customer_id', type=int)
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        search = request.args.get('search', '').strip()
        
        # Build query
        query = db.session.query(Invoice).filter(Invoice.company_id == company.id)
        
        # Apply filters
        if status:
            query = query.filter(Invoice.status == status)
        
        if customer_id:
            query = query.filter(Invoice.customer_id == customer_id)
        
        if date_from:
            try:
                date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                query = query.filter(Invoice.date_issued >= date_from_obj)
            except ValueError:
                return jsonify({'error': 'Invalid date_from format. Use YYYY-MM-DD'}), 400
        
        if date_to:
            try:
                date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                query = query.filter(Invoice.date_issued <= date_to_obj)
            except ValueError:
                return jsonify({'error': 'Invalid date_to format. Use YYYY-MM-DD'}), 400
        
        if search:
            query = query.join(Customer).filter(
                or_(
                    Invoice.invoice_number.ilike(f'%{search}%'),
                    Customer.first_name.ilike(f'%{search}%'),
                    Customer.last_name.ilike(f'%{search}%'),
                    Invoice.notes.ilike(f'%{search}%')
                )
            )
        
        # Get total count for pagination
        total = query.count()
        
        # Apply pagination and ordering
        invoices = query.options(
            joinedload(Invoice.customer),
            joinedload(Invoice.work_order)
        ).order_by(desc(Invoice.created_at)).offset((page - 1) * limit).limit(limit).all()
        
        # Calculate summary statistics
        summary_query = db.session.query(Invoice).filter(Invoice.company_id == company.id)
        if status:
            summary_query = summary_query.filter(Invoice.status == status)
        
        all_invoices = summary_query.all()
        total_amount = sum(float(inv.total_amount) for inv in all_invoices)
        paid_amount = sum(float(inv.amount_paid) for inv in all_invoices)
        pending_amount = sum(float(inv.amount_due) for inv in all_invoices if inv.status in ['sent', 'draft'])
        overdue_amount = sum(float(inv.amount_due) for inv in all_invoices if inv.is_overdue)
        
        return jsonify({
            'invoices': [invoice.to_dict() for invoice in invoices],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'totalPages': (total + limit - 1) // limit
            },
            'summary': {
                'totalAmount': total_amount,
                'paidAmount': paid_amount,
                'pendingAmount': pending_amount,
                'overdueAmount': overdue_amount
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/api/invoices', methods=['POST'])
@require_auth
def create_invoice():
    """Create a new invoice"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'error': 'User not associated with any company'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('customer_id'):
            return jsonify({'error': 'customer_id is required'}), 400
        
        if not data.get('due_date'):
            return jsonify({'error': 'due_date is required'}), 400
        
        # Verify customer belongs to the same company
        customer = db.session.query(Customer).filter(
            and_(Customer.id == data['customer_id'], Customer.company_id == company.id)
        ).first()
        
        if not customer:
            return jsonify({'error': 'Customer not found or not accessible'}), 404
        
        # Parse due date
        try:
            due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid due_date format. Use YYYY-MM-DD'}), 400
        
        # Create invoice
        invoice = Invoice(
            company_id=company.id,
            customer_id=data['customer_id'],
            work_order_id=data.get('work_order_id'),
            invoice_number=generate_invoice_number(company.id),
            due_date=due_date,
            payment_terms=data.get('payment_terms', customer.preferred_payment_terms or 'Net 30'),
            notes=data.get('notes', ''),
            tax_rate=data.get('tax_rate', company.default_tax_rate)
        )
        
        db.session.add(invoice)
        db.session.flush()  # Get the invoice ID
        
        # Add line items if provided
        line_items_data = data.get('line_items', [])
        for i, item_data in enumerate(line_items_data):
            if not item_data.get('description'):
                return jsonify({'error': f'Line item {i+1}: description is required'}), 400
            
            if not item_data.get('unit_price'):
                return jsonify({'error': f'Line item {i+1}: unit_price is required'}), 400
            
            line_item = InvoiceLineItem(
                invoice_id=invoice.id,
                service_id=item_data.get('service_id'),
                material_id=item_data.get('material_id'),
                line_number=i + 1,
                description=item_data['description'],
                quantity=item_data.get('quantity', 1.0),
                unit_price=item_data['unit_price'],
                item_type=item_data.get('item_type', 'other')
            )
            line_item.calculate_total()
            db.session.add(line_item)
        
        # Calculate invoice totals
        db.session.flush()  # Ensure line items are saved
        invoice.calculate_totals()
        
        db.session.commit()
        
        # Return the created invoice with details
        created_invoice = db.session.query(Invoice).options(
            joinedload(Invoice.customer),
            joinedload(Invoice.work_order),
            joinedload(Invoice.line_items),
            joinedload(Invoice.payments)
        ).filter(Invoice.id == invoice.id).first()
        
        return jsonify({
            'invoice': created_invoice.to_dict(include_details=True),
            'success': True,
            'message': 'Invoice created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/api/invoices/<int:invoice_id>', methods=['GET'])
@require_auth
def get_invoice(invoice_id):
    """Get a specific invoice with full details"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'error': 'User not associated with any company'}), 403
        
        # Get invoice with all related data
        invoice = db.session.query(Invoice).options(
            joinedload(Invoice.customer),
            joinedload(Invoice.work_order),
            joinedload(Invoice.line_items),
            joinedload(Invoice.payments)
        ).filter(
            and_(Invoice.id == invoice_id, Invoice.company_id == company.id)
        ).first()
        
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
        
        # Calculate additional metrics
        calculations = {
            'subtotal': float(invoice.subtotal),
            'tax_amount': float(invoice.tax_amount),
            'total_amount': float(invoice.total_amount),
            'amount_paid': float(invoice.amount_paid),
            'amount_due': float(invoice.amount_due)
        }
        
        return jsonify({
            'invoice': invoice.to_dict(include_details=True),
            'calculations': calculations
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Customer Management

@invoice_bp.route('/api/customers', methods=['GET'])
@require_auth
def get_customers():
    """Get list of customers for the company"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'error': 'User not associated with any company'}), 403
        
        search = request.args.get('search', '').strip()
        
        query = db.session.query(Customer).filter(Customer.company_id == company.id)
        
        if search:
            query = query.filter(
                or_(
                    Customer.first_name.ilike(f'%{search}%'),
                    Customer.last_name.ilike(f'%{search}%'),
                    Customer.email.ilike(f'%{search}%'),
                    Customer.phone.ilike(f'%{search}%')
                )
            )
        
        customers = query.order_by(Customer.first_name, Customer.last_name).all()
        
        return jsonify({
            'customers': [customer.to_dict() for customer in customers]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@invoice_bp.route('/api/customers', methods=['POST'])
@require_auth
def create_customer():
    """Create a new customer"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'error': 'User not associated with any company'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('first_name'):
            return jsonify({'error': 'first_name is required'}), 400
        
        if not data.get('last_name'):
            return jsonify({'error': 'last_name is required'}), 400
        
        # Create customer
        customer = Customer(
            company_id=company.id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            zip_code=data.get('zip_code'),
            preferred_payment_terms=data.get('preferred_payment_terms', 'Net 30'),
            tax_exempt=data.get('tax_exempt', False),
            discount_rate=data.get('discount_rate', 0.0)
        )
        
        db.session.add(customer)
        db.session.commit()
        
        return jsonify({
            'customer': customer.to_dict(),
            'success': True,
            'message': 'Customer created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Simple test endpoint
@invoice_bp.route('/api/invoices/test', methods=['GET'])
def test_invoices():
    """Test endpoint to verify invoice routes are working"""
    return jsonify({
        'message': 'Invoice API is working!',
        'endpoints': [
            'GET /api/invoices - List invoices',
            'POST /api/invoices - Create invoice',
            'GET /api/invoices/<id> - Get invoice details',
            'GET /api/customers - List customers',
            'POST /api/customers - Create customer'
        ]
    }), 200



@invoice_bp.route('/<int:invoice_id>/pdf', methods=['GET'])
@require_auth
def generate_invoice_pdf(invoice_id):
    """Generate and download PDF for an invoice"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        # Get invoice with line items
        invoice = db.session.query(Invoice).options(
            joinedload(Invoice.line_items),
            joinedload(Invoice.customer)
        ).filter(
            and_(Invoice.id == invoice_id, Invoice.company_id == company.id)
        ).first()
        
        if not invoice:
            return jsonify({'success': False, 'message': 'Invoice not found'}), 404
        
        # Import PDF generator
        from src.utils.pdf_generator import generate_invoice_pdf
        
        # Prepare invoice data
        invoice_data = {
            'invoice_number': invoice.invoice_number,
            'invoice_date': invoice.invoice_date.strftime('%B %d, %Y') if invoice.invoice_date else '',
            'due_date': invoice.due_date.strftime('%B %d, %Y') if invoice.due_date else '',
            'status': invoice.status,
            'subtotal': float(invoice.subtotal),
            'tax_amount': float(invoice.tax_amount),
            'total_amount': float(invoice.total_amount)
        }
        
        # Prepare company data
        company_data = {
            'company_name': company.company_name,
            'address': company.address or '',
            'city': company.city or '',
            'state': company.state or '',
            'zip_code': company.zip_code or '',
            'contact_phone': company.contact_phone or '',
            'contact_email': company.contact_email or '',
            'payment_terms': 'Payment is due within 30 days of invoice date.'
        }
        
        # Prepare customer data
        customer_data = {}
        if invoice.customer:
            customer_data = {
                'name': f"{invoice.customer.first_name} {invoice.customer.last_name}".strip(),
                'company': invoice.customer.company or '',
                'address': invoice.customer.address or '',
                'city': invoice.customer.city or '',
                'state': invoice.customer.state or '',
                'zip_code': invoice.customer.zip_code or '',
                'phone': invoice.customer.phone or '',
                'email': invoice.customer.email or ''
            }
        
        # Prepare line items data
        line_items = []
        for item in invoice.line_items:
            line_items.append({
                'description': item.description,
                'quantity': float(item.quantity),
                'unit_price': float(item.unit_price),
                'total_price': float(item.total_price)
            })
        
        # Generate PDF
        pdf_buffer = generate_invoice_pdf(invoice_data, company_data, customer_data, line_items)
        
        # Create response
        from flask import Response
        response = Response(
            pdf_buffer.getvalue(),
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename=invoice_{invoice.invoice_number}.pdf'
            }
        )
        
        return response
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error generating PDF: {str(e)}'}), 500


@invoice_bp.route('/<int:invoice_id>/pdf/preview', methods=['GET'])
@require_auth
def preview_invoice_pdf(invoice_id):
    """Preview PDF for an invoice (inline display)"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        # Get invoice with line items
        invoice = db.session.query(Invoice).options(
            joinedload(Invoice.line_items),
            joinedload(Invoice.customer)
        ).filter(
            and_(Invoice.id == invoice_id, Invoice.company_id == company.id)
        ).first()
        
        if not invoice:
            return jsonify({'success': False, 'message': 'Invoice not found'}), 404
        
        # Import PDF generator
        from src.utils.pdf_generator import generate_invoice_pdf
        
        # Prepare data (same as above)
        invoice_data = {
            'invoice_number': invoice.invoice_number,
            'invoice_date': invoice.invoice_date.strftime('%B %d, %Y') if invoice.invoice_date else '',
            'due_date': invoice.due_date.strftime('%B %d, %Y') if invoice.due_date else '',
            'status': invoice.status,
            'subtotal': float(invoice.subtotal),
            'tax_amount': float(invoice.tax_amount),
            'total_amount': float(invoice.total_amount)
        }
        
        company_data = {
            'company_name': company.company_name,
            'address': company.address or '',
            'city': company.city or '',
            'state': company.state or '',
            'zip_code': company.zip_code or '',
            'contact_phone': company.contact_phone or '',
            'contact_email': company.contact_email or '',
            'payment_terms': 'Payment is due within 30 days of invoice date.'
        }
        
        customer_data = {}
        if invoice.customer:
            customer_data = {
                'name': f"{invoice.customer.first_name} {invoice.customer.last_name}".strip(),
                'company': invoice.customer.company or '',
                'address': invoice.customer.address or '',
                'city': invoice.customer.city or '',
                'state': invoice.customer.state or '',
                'zip_code': invoice.customer.zip_code or '',
                'phone': invoice.customer.phone or '',
                'email': invoice.customer.email or ''
            }
        
        line_items = []
        for item in invoice.line_items:
            line_items.append({
                'description': item.description,
                'quantity': float(item.quantity),
                'unit_price': float(item.unit_price),
                'total_price': float(item.total_price)
            })
        
        # Generate PDF
        pdf_buffer = generate_invoice_pdf(invoice_data, company_data, customer_data, line_items)
        
        # Create response for inline display
        from flask import Response
        response = Response(
            pdf_buffer.getvalue(),
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'inline; filename=invoice_{invoice.invoice_number}.pdf'
            }
        )
        
        return response
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error generating PDF: {str(e)}'}), 500

