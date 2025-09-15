from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.estimate import Estimate, EstimateStatus, EstimateLineItem
from src.models.customer import Customer
from src.routes.auth import token_required
from datetime import datetime, timedelta

estimates_bp = Blueprint('estimates', __name__)

@estimates_bp.route('/estimates', methods=['GET'])
@token_required
def get_estimates(current_user):
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        status = request.args.get('status', '')
        customer_id = request.args.get('customer_id', type=int)
        search = request.args.get('search', '')
        
        # Build query
        query = Estimate.query.filter_by(company_id=current_user.company_id)
        
        # Apply filters
        if status:
            query = query.filter_by(status=EstimateStatus(status))
            
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
            
        if search:
            search_term = f"%{search}%"
            query = query.join(Customer).filter(
                db.or_(
                    Estimate.estimate_number.ilike(search_term),
                    Estimate.title.ilike(search_term),
                    Estimate.description.ilike(search_term),
                    Customer.first_name.ilike(search_term),
                    Customer.last_name.ilike(search_term)
                )
            )
        
        # Order by creation date
        query = query.order_by(Estimate.created_at.desc())
        
        # Paginate
        estimates = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Include customer info in response
        estimates_data = []
        for estimate in estimates.items:
            estimate_data = estimate.to_dict()
            if estimate.customer:
                estimate_data['customer'] = {
                    'id': estimate.customer.id,
                    'name': estimate.customer.display_name,
                    'phone': estimate.customer.phone,
                    'email': estimate.customer.email
                }
            estimates_data.append(estimate_data)
        
        return jsonify({
            'estimates': estimates_data,
            'total': estimates.total,
            'pages': estimates.pages,
            'current_page': estimates.page,
            'per_page': estimates.per_page,
            'has_next': estimates.has_next,
            'has_prev': estimates.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get estimates: {str(e)}'}), 500

@estimates_bp.route('/estimates/<int:estimate_id>', methods=['GET'])
@token_required
def get_estimate(current_user, estimate_id):
    try:
        estimate = Estimate.query.filter_by(
            id=estimate_id, 
            company_id=current_user.company_id
        ).first()
        
        if not estimate:
            return jsonify({'message': 'Estimate not found'}), 404
        
        # Include customer info
        estimate_data = estimate.to_dict()
        if estimate.customer:
            estimate_data['customer'] = estimate.customer.to_dict()
        
        return jsonify(estimate_data), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get estimate: {str(e)}'}), 500

@estimates_bp.route('/estimates', methods=['POST'])
@token_required
def create_estimate(current_user):
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
        
        # Generate estimate number
        estimate_count = Estimate.query.filter_by(company_id=current_user.company_id).count()
        estimate_number = f"EST-{estimate_count + 1:06d}"
        
        # Set validity period (default 30 days)
        validity_days = data.get('validity_days', 30)
        valid_until = datetime.utcnow() + timedelta(days=validity_days)
        
        # Create estimate
        estimate = Estimate(
            company_id=current_user.company_id,
            customer_id=data['customer_id'],
            estimate_number=estimate_number,
            title=data['title'],
            description=data.get('description'),
            status=EstimateStatus(data['status']) if data.get('status') else EstimateStatus.DRAFT,
            valid_until=valid_until,
            tax_rate=data.get('tax_rate', 8.5),
            discount_amount=data.get('discount_amount', 0.0),
            terms_conditions=data.get('terms_conditions'),
            notes=data.get('notes')
        )
        
        db.session.add(estimate)
        db.session.flush()  # Get the estimate ID
        
        # Add line items if provided
        if data.get('line_items'):
            for item_data in data['line_items']:
                line_item = EstimateLineItem(
                    estimate_id=estimate.id,
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
                line_item.calculate_total()
                db.session.add(line_item)
        
        # Calculate totals
        estimate.calculate_totals()
        db.session.commit()
        
        return jsonify({
            'message': 'Estimate created successfully',
            'estimate': estimate.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create estimate: {str(e)}'}), 500

@estimates_bp.route('/estimates/<int:estimate_id>', methods=['PUT'])
@token_required
def update_estimate(current_user, estimate_id):
    try:
        estimate = Estimate.query.filter_by(
            id=estimate_id, 
            company_id=current_user.company_id
        ).first()
        
        if not estimate:
            return jsonify({'message': 'Estimate not found'}), 404
        
        data = request.get_json()
        
        # Update basic fields
        updatable_fields = [
            'title', 'description', 'tax_rate', 'discount_amount',
            'terms_conditions', 'notes'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(estimate, field, data[field])
        
        # Handle status changes
        if 'status' in data:
            new_status = EstimateStatus(data['status'])
            old_status = estimate.status
            estimate.status = new_status
            
            # Track status change timestamps
            if new_status == EstimateStatus.SENT and old_status != EstimateStatus.SENT:
                estimate.sent_at = datetime.utcnow()
            elif new_status == EstimateStatus.APPROVED and old_status != EstimateStatus.APPROVED:
                estimate.approved_at = datetime.utcnow()
            elif new_status == EstimateStatus.REJECTED and old_status != EstimateStatus.REJECTED:
                estimate.rejected_at = datetime.utcnow()
        
        # Update validity period
        if 'validity_days' in data:
            estimate.valid_until = datetime.utcnow() + timedelta(days=data['validity_days'])
        
        # Update line items if provided
        if 'line_items' in data:
            # Remove existing line items
            EstimateLineItem.query.filter_by(estimate_id=estimate.id).delete()
            
            # Add new line items
            for item_data in data['line_items']:
                line_item = EstimateLineItem(
                    estimate_id=estimate.id,
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
                line_item.calculate_total()
                db.session.add(line_item)
        
        # Recalculate totals
        estimate.calculate_totals()
        estimate.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Estimate updated successfully',
            'estimate': estimate.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update estimate: {str(e)}'}), 500

@estimates_bp.route('/estimates/<int:estimate_id>/send', methods=['POST'])
@token_required
def send_estimate(current_user, estimate_id):
    try:
        estimate = Estimate.query.filter_by(
            id=estimate_id, 
            company_id=current_user.company_id
        ).first()
        
        if not estimate:
            return jsonify({'message': 'Estimate not found'}), 404
        
        # Update status and timestamp
        estimate.status = EstimateStatus.SENT
        estimate.sent_at = datetime.utcnow()
        db.session.commit()
        
        # In a real implementation, you would send the estimate via email here
        
        return jsonify({
            'message': 'Estimate sent successfully',
            'estimate': estimate.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to send estimate: {str(e)}'}), 500

@estimates_bp.route('/estimates/<int:estimate_id>/approve', methods=['POST'])
@token_required
def approve_estimate(current_user, estimate_id):
    try:
        estimate = Estimate.query.filter_by(
            id=estimate_id, 
            company_id=current_user.company_id
        ).first()
        
        if not estimate:
            return jsonify({'message': 'Estimate not found'}), 404
        
        if estimate.is_expired:
            return jsonify({'message': 'Estimate has expired'}), 400
        
        # Update status and timestamp
        estimate.status = EstimateStatus.APPROVED
        estimate.approved_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Estimate approved successfully',
            'estimate': estimate.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to approve estimate: {str(e)}'}), 500

@estimates_bp.route('/estimates/<int:estimate_id>/reject', methods=['POST'])
@token_required
def reject_estimate(current_user, estimate_id):
    try:
        estimate = Estimate.query.filter_by(
            id=estimate_id, 
            company_id=current_user.company_id
        ).first()
        
        if not estimate:
            return jsonify({'message': 'Estimate not found'}), 404
        
        data = request.get_json()
        
        # Update status and timestamp
        estimate.status = EstimateStatus.REJECTED
        estimate.rejected_at = datetime.utcnow()
        
        # Add rejection reason to notes
        if data and data.get('reason'):
            rejection_note = f"Rejected: {data['reason']}"
            if estimate.notes:
                estimate.notes += f"\n\n{rejection_note}"
            else:
                estimate.notes = rejection_note
        
        db.session.commit()
        
        return jsonify({
            'message': 'Estimate rejected',
            'estimate': estimate.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to reject estimate: {str(e)}'}), 500

@estimates_bp.route('/estimates/<int:estimate_id>/convert-to-job', methods=['POST'])
@token_required
def convert_estimate_to_job(current_user, estimate_id):
    try:
        estimate = Estimate.query.filter_by(
            id=estimate_id, 
            company_id=current_user.company_id
        ).first()
        
        if not estimate:
            return jsonify({'message': 'Estimate not found'}), 404
        
        if estimate.status != EstimateStatus.APPROVED:
            return jsonify({'message': 'Only approved estimates can be converted to jobs'}), 400
        
        # Import Job model here to avoid circular imports
        from src.models.job import Job, JobStatus
        
        # Generate job number
        job_count = Job.query.filter_by(company_id=current_user.company_id).count()
        job_number = f"JOB-{job_count + 1:06d}"
        
        # Create job from estimate
        job = Job(
            company_id=current_user.company_id,
            customer_id=estimate.customer_id,
            job_number=job_number,
            title=estimate.title,
            description=estimate.description,
            status=JobStatus.SCHEDULED,
            estimated_cost=estimate.total_amount,
            service_address=estimate.customer.address,
            service_city=estimate.customer.city,
            service_state=estimate.customer.state,
            service_zip=estimate.customer.zip_code
        )
        
        db.session.add(job)
        
        # Update estimate status
        estimate.status = EstimateStatus.CONVERTED
        
        db.session.commit()
        
        return jsonify({
            'message': 'Estimate converted to job successfully',
            'job_id': job.id,
            'job_number': job.job_number
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to convert estimate: {str(e)}'}), 500

@estimates_bp.route('/estimates/stats', methods=['GET'])
@token_required
def get_estimate_stats(current_user):
    try:
        total_estimates = Estimate.query.filter_by(company_id=current_user.company_id).count()
        draft_estimates = Estimate.query.filter_by(
            company_id=current_user.company_id, 
            status=EstimateStatus.DRAFT
        ).count()
        sent_estimates = Estimate.query.filter_by(
            company_id=current_user.company_id, 
            status=EstimateStatus.SENT
        ).count()
        approved_estimates = Estimate.query.filter_by(
            company_id=current_user.company_id, 
            status=EstimateStatus.APPROVED
        ).count()
        
        # Calculate total estimate value
        total_value = db.session.query(db.func.sum(Estimate.total_amount))\
            .filter_by(company_id=current_user.company_id).scalar() or 0
        
        approved_value = db.session.query(db.func.sum(Estimate.total_amount))\
            .filter_by(company_id=current_user.company_id, status=EstimateStatus.APPROVED)\
            .scalar() or 0
        
        return jsonify({
            'total_estimates': total_estimates,
            'draft_estimates': draft_estimates,
            'sent_estimates': sent_estimates,
            'approved_estimates': approved_estimates,
            'rejected_estimates': Estimate.query.filter_by(
                company_id=current_user.company_id, 
                status=EstimateStatus.REJECTED
            ).count(),
            'total_value': total_value,
            'approved_value': approved_value,
            'conversion_rate': (approved_estimates / sent_estimates * 100) if sent_estimates > 0 else 0
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get estimate stats: {str(e)}'}), 500

