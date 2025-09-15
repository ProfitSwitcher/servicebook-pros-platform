from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.invoice import Invoice, InvoiceStatus, InvoiceLineItem, Payment, PaymentMethod
from src.models.customer import Customer
from src.routes.auth import token_required
from datetime import datetime, timedelta

invoices_bp = Blueprint('invoices', __name__)

@invoices_bp.route('/invoices', methods=['GET'])
@token_required
def get_invoices(current_user):
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        status = request.args.get('status', '')
        customer_id = request.args.get('customer_id', type=int)
        search = request.args.get('search', '')
        overdue_only = request.args.get('overdue', 'false').lower() == 'true'
        
        # Build query
        query = Invoice.query.filter_by(company_id=current_user.company_id)
        
        # Apply filters
        if status:
            query = query.filter_by(status=InvoiceStatus(status))
            
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
            
        if overdue_only:
            query = query.filter(
                Invoice.due_date < datetime.utcnow(),
                Invoice.balance_due > 0
            )
            
        if search:
            search_term = f"%{search}%"
            query = query.join(Customer).filter(
                db.or_(
                    Invoice.invoice_number.ilike(search_term),
                    Invoice.title.ilike(search_term),
                    Invoice.description.ilike(search_term),
                    Customer.first_name.ilike(search_term),
                    Customer.last_name.ilike(search_term)
                )
            )
        
        # Order by invoice date
        query = query.order_by(Invoice.invoice_date.desc())
        
        # Paginate
        invoices = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Include customer info in response
        invoices_data = []
        for invoice in invoices.items:
            invoice_data = invoice.to_dict()
            if invoice.customer:
                invoice_data['customer'] = {
                    'id': invoice.customer.id,
                    'name': invoice.customer.display_name,
                    'phone': invoice.customer.phone,
                    'email': invoice.customer.email
                }
            invoices_data.append(invoice_data)
        
        return jsonify({
            'invoices': invoices_data,
            'total': invoices.total,
            'pages': invoices.pages,
            'current_page': invoices.page,
            'per_page': invoices.per_page,
            'has_next': invoices.has_next,
            'has_prev': invoices.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get invoices: {str(e)}'}), 500

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
@token_required
def get_invoice(current_user, invoice_id):
    try:
        invoice = Invoice.query.filter_by(
            id=invoice_id, 
            company_id=current_user.company_id
        ).first()
        
        if not invoice:
            return jsonify({'message': 'Invoice not found'}), 404
        
        # Include customer info
        invoice_data = invoice.to_dict()
        if invoice.customer:
            invoice_data['customer'] = invoice.customer.to_dict()
        
        return jsonify(invoice_data), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get invoice: {str(e)}'}), 500

@invoices_bp.route('/invoices', methods=['POST'])
@token_required
def create_invoice(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customer_id', 'title']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Verify customer exists and belongs to company
        customer = Customer.query.filter_by(
            id=data['customer_id'],
            company_id=current_user.company_id
        ).first()
        
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        
        # Generate invoice number
        invoice_count = Invoice.query.filter_by(company_id=current_user.company_id).count()
        invoice_number = f"INV-{invoice_count + 1:06d}"
        
        # Set due date based on payment terms
        payment_terms = data.get('payment_terms', 'Net 30')
        if payment_terms == 'Net 30':
            due_date = datetime.utcnow() + timedelta(days=30)
        elif payment_terms == 'Net 15':
            due_date = datetime.utcnow() + timedelta(days=15)
        elif payment_terms == 'Due on Receipt':
            due_date = datetime.utcnow()
        else:
            due_date = datetime.utcnow() + timedelta(days=30)
        
        # Create invoice
        invoice = Invoice(
            company_id=current_user.company_id,
            customer_id=data['customer_id'],
            job_id=data.get('job_id'),
            estimate_id=data.get('estimate_id'),
            invoice_number=invoice_number,
            title=data['title'],
            description=data.get('description'),
            status=InvoiceStatus(data['status']) if data.get('status') else InvoiceStatus.DRAFT,
            invoice_date=datetime.utcnow(),
            due_date=due_date,
            tax_rate=data.get('tax_rate', 8.5),
            discount_amount=data.get('discount_amount', 0.0),
            payment_terms=payment_terms,
            terms_conditions=data.get('terms_conditions'),
            notes=data.get('notes')
        )
        
        db.session.add(invoice)
        db.session.flush()  # Get the invoice ID
        
        # Add line items if provided
        if data.get('line_items'):
            for item_data in data['line_items']:
                line_item = InvoiceLineItem(
                    invoice_id=invoice.id,
                    item_type=item_data.get('item_type', 'service'),
                    description=item_data['description'],
                    category=item_data.get('category'),
                    quantity=item_data.get('quantity', 1.0),
                    unit_price=item_data['unit_price'],
                    total_price=item_data.get('quantity', 1.0) * item_data['unit_price'],
                    labor_hours=item_data.get('labor_hours'),
                    labor_rate=item_data.get('labor_rate'),
                    material_cost=item_data.get('material_cost'),
                    markup_percentage=item_data.get('markup_percentage', 20.0),
                    flat_rate_code=item_data.get('flat_rate_code'),
                    is_flat_rate=item_data.get('is_flat_rate', False),
                    sort_order=item_data.get('sort_order', 0)
                )
                db.session.add(line_item)
        
        # Calculate totals
        invoice.calculate_totals()
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice created successfully',
            'invoice': invoice.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create invoice: {str(e)}'}), 500

@invoices_bp.route('/invoices/<int:invoice_id>', methods=['PUT'])
@token_required
def update_invoice(current_user, invoice_id):
    try:
        invoice = Invoice.query.filter_by(
            id=invoice_id, 
            company_id=current_user.company_id
        ).first()
        
        if not invoice:
            return jsonify({'message': 'Invoice not found'}), 404
        
        data = request.get_json()
        
        # Update basic fields
        updatable_fields = [
            'title', 'description', 'tax_rate', 'discount_amount',
            'payment_terms', 'terms_conditions', 'notes'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(invoice, field, data[field])
        
        # Handle status changes
        if 'status' in data:
            new_status = InvoiceStatus(data['status'])
            old_status = invoice.status
            invoice.status = new_status
            
            # Track status change timestamps
            if new_status == InvoiceStatus.SENT and old_status != InvoiceStatus.SENT:
                invoice.sent_at = datetime.utcnow()
        
        # Update due date if payment terms changed
        if 'payment_terms' in data:
            payment_terms = data['payment_terms']
            if payment_terms == 'Net 30':
                invoice.due_date = invoice.invoice_date + timedelta(days=30)
            elif payment_terms == 'Net 15':
                invoice.due_date = invoice.invoice_date + timedelta(days=15)
            elif payment_terms == 'Due on Receipt':
                invoice.due_date = invoice.invoice_date
        
        # Update line items if provided
        if 'line_items' in data:
            # Remove existing line items
            InvoiceLineItem.query.filter_by(invoice_id=invoice.id).delete()
            
            # Add new line items
            for item_data in data['line_items']:
                line_item = InvoiceLineItem(
                    invoice_id=invoice.id,
                    item_type=item_data.get('item_type', 'service'),
                    description=item_data['description'],
                    category=item_data.get('category'),
                    quantity=item_data.get('quantity', 1.0),
                    unit_price=item_data['unit_price'],
                    total_price=item_data.get('quantity', 1.0) * item_data['unit_price'],
                    labor_hours=item_data.get('labor_hours'),
                    labor_rate=item_data.get('labor_rate'),
                    material_cost=item_data.get('material_cost'),
                    markup_percentage=item_data.get('markup_percentage', 20.0),
                    flat_rate_code=item_data.get('flat_rate_code'),
                    is_flat_rate=item_data.get('is_flat_rate', False),
                    sort_order=item_data.get('sort_order', 0)
                )
                db.session.add(line_item)
        
        # Recalculate totals
        invoice.calculate_totals()
        invoice.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Invoice updated successfully',
            'invoice': invoice.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update invoice: {str(e)}'}), 500

@invoices_bp.route('/invoices/<int:invoice_id>/payments', methods=['GET'])
@token_required
def get_invoice_payments(current_user, invoice_id):
    try:
        invoice = Invoice.query.filter_by(
            id=invoice_id, 
            company_id=current_user.company_id
        ).first()
        
        if not invoice:
            return jsonify({'message': 'Invoice not found'}), 404
        
        payments = Payment.query.filter_by(invoice_id=invoice_id)\
            .order_by(Payment.payment_date.desc()).all()
        
        return jsonify({
            'payments': [payment.to_dict() for payment in payments]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get payments: {str(e)}'}), 500

@invoices_bp.route('/invoices/<int:invoice_id>/payments', methods=['POST'])
@token_required
def create_payment(current_user, invoice_id):
    try:
        invoice = Invoice.query.filter_by(
            id=invoice_id, 
            company_id=current_user.company_id
        ).first()
        
        if not invoice:
            return jsonify({'message': 'Invoice not found'}), 404
        
        data = request.get_json()
        
        if not data.get('amount'):
            return jsonify({'message': 'Payment amount is required'}), 400
        
        amount = float(data['amount'])
        
        if amount <= 0:
            return jsonify({'message': 'Payment amount must be greater than 0'}), 400
        
        if amount > invoice.balance_due:
            return jsonify({'message': 'Payment amount cannot exceed balance due'}), 400
        
        # Create payment
        payment = Payment(
            invoice_id=invoice_id,
            company_id=current_user.company_id,
            payment_date=datetime.fromisoformat(data['payment_date'].replace('Z', '+00:00')) if data.get('payment_date') else datetime.utcnow(),
            amount=amount,
            payment_method=PaymentMethod(data['payment_method']) if data.get('payment_method') else PaymentMethod.CASH,
            reference_number=data.get('reference_number'),
            check_number=data.get('check_number'),
            transaction_id=data.get('transaction_id'),
            notes=data.get('notes')
        )
        
        db.session.add(payment)
        
        # Update invoice paid amount and recalculate
        invoice.paid_amount += amount
        invoice.calculate_totals()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Payment recorded successfully',
            'payment': payment.to_dict(),
            'invoice': invoice.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to record payment: {str(e)}'}), 500

@invoices_bp.route('/invoices/<int:invoice_id>/send', methods=['POST'])
@token_required
def send_invoice(current_user, invoice_id):
    try:
        invoice = Invoice.query.filter_by(
            id=invoice_id, 
            company_id=current_user.company_id
        ).first()
        
        if not invoice:
            return jsonify({'message': 'Invoice not found'}), 404
        
        # Update status and timestamp
        invoice.status = InvoiceStatus.SENT
        invoice.sent_at = datetime.utcnow()
        db.session.commit()
        
        # In a real implementation, you would send the invoice via email here
        
        return jsonify({
            'message': 'Invoice sent successfully',
            'invoice': invoice.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to send invoice: {str(e)}'}), 500

@invoices_bp.route('/invoices/overdue', methods=['GET'])
@token_required
def get_overdue_invoices(current_user):
    try:
        overdue_invoices = Invoice.query.filter(
            Invoice.company_id == current_user.company_id,
            Invoice.due_date < datetime.utcnow(),
            Invoice.balance_due > 0
        ).order_by(Invoice.due_date.asc()).all()
        
        invoices_data = []
        for invoice in overdue_invoices:
            invoice_data = invoice.to_dict()
            invoice_data['days_overdue'] = invoice.days_overdue
            if invoice.customer:
                invoice_data['customer'] = {
                    'id': invoice.customer.id,
                    'name': invoice.customer.display_name,
                    'phone': invoice.customer.phone,
                    'email': invoice.customer.email
                }
            invoices_data.append(invoice_data)
        
        return jsonify({
            'overdue_invoices': invoices_data,
            'total_overdue': len(overdue_invoices),
            'total_overdue_amount': sum(invoice.balance_due for invoice in overdue_invoices)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get overdue invoices: {str(e)}'}), 500

@invoices_bp.route('/invoices/stats', methods=['GET'])
@token_required
def get_invoice_stats(current_user):
    try:
        total_invoices = Invoice.query.filter_by(company_id=current_user.company_id).count()
        
        # Status counts
        draft_invoices = Invoice.query.filter_by(
            company_id=current_user.company_id, 
            status=InvoiceStatus.DRAFT
        ).count()
        
        sent_invoices = Invoice.query.filter_by(
            company_id=current_user.company_id, 
            status=InvoiceStatus.SENT
        ).count()
        
        paid_invoices = Invoice.query.filter_by(
            company_id=current_user.company_id, 
            status=InvoiceStatus.PAID
        ).count()
        
        overdue_invoices = Invoice.query.filter(
            Invoice.company_id == current_user.company_id,
            Invoice.due_date < datetime.utcnow(),
            Invoice.balance_due > 0
        ).count()
        
        # Financial totals
        total_invoiced = db.session.query(db.func.sum(Invoice.total_amount))\
            .filter_by(company_id=current_user.company_id).scalar() or 0
        
        total_paid = db.session.query(db.func.sum(Invoice.paid_amount))\
            .filter_by(company_id=current_user.company_id).scalar() or 0
        
        total_outstanding = db.session.query(db.func.sum(Invoice.balance_due))\
            .filter_by(company_id=current_user.company_id).scalar() or 0
        
        overdue_amount = db.session.query(db.func.sum(Invoice.balance_due))\
            .filter(
                Invoice.company_id == current_user.company_id,
                Invoice.due_date < datetime.utcnow(),
                Invoice.balance_due > 0
            ).scalar() or 0
        
        return jsonify({
            'total_invoices': total_invoices,
            'draft_invoices': draft_invoices,
            'sent_invoices': sent_invoices,
            'paid_invoices': paid_invoices,
            'overdue_invoices': overdue_invoices,
            'total_invoiced': total_invoiced,
            'total_paid': total_paid,
            'total_outstanding': total_outstanding,
            'overdue_amount': overdue_amount,
            'collection_rate': (total_paid / total_invoiced * 100) if total_invoiced > 0 else 0
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get invoice stats: {str(e)}'}), 500

