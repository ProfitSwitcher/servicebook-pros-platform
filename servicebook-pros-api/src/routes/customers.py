from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.customer import Customer, CustomerContact, CustomerHistory
from src.routes.auth import token_required
from datetime import datetime
import json

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/', methods=['GET'])
@token_required
def get_customers(current_user):
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        customer_type = request.args.get('type', '')
        
        # Build query
        query = Customer.query.filter_by(company_id=current_user.company_id)
        
        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Customer.first_name.ilike(search_term),
                    Customer.last_name.ilike(search_term),
                    Customer.email.ilike(search_term),
                    Customer.phone.ilike(search_term),
                    Customer.company_name.ilike(search_term)
                )
            )
        
        if status:
            query = query.filter_by(status=status)
            
        if customer_type:
            query = query.filter_by(customer_type=customer_type)
        
        # Order by last name, first name
        query = query.order_by(Customer.last_name, Customer.first_name)
        
        # Paginate
        customers = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'customers': [customer.to_dict() for customer in customers.items],
            'total': customers.total,
            'pages': customers.pages,
            'current_page': customers.page,
            'per_page': customers.per_page,
            'has_next': customers.has_next,
            'has_prev': customers.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get customers: {str(e)}'}), 500

@customers_bp.route('/<int:customer_id>', methods=['GET'])
@token_required
def get_customer(current_user, customer_id):
    try:
        customer = Customer.query.filter_by(
            id=customer_id, 
            company_id=current_user.company_id
        ).first()
        
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        
        # Include contacts and recent history
        customer_data = customer.to_dict()
        customer_data['contacts'] = [contact.to_dict() for contact in customer.contacts]
        customer_data['recent_history'] = [
            history.to_dict() for history in 
            customer.history[:10]  # Last 10 history entries
        ]
        
        return jsonify(customer_data), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get customer: {str(e)}'}), 500

@customers_bp.route('/', methods=['POST'])
@token_required
def create_customer(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Create customer
        customer = Customer(
            company_id=current_user.company_id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data.get('email'),
            phone=data.get('phone'),
            mobile=data.get('mobile'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            zip_code=data.get('zip_code'),
            country=data.get('country', 'USA'),
            company_name=data.get('company_name'),
            customer_type=data.get('customer_type', 'residential'),
            status=data.get('status', 'active'),
            preferred_contact_method=data.get('preferred_contact_method', 'phone'),
            notes=data.get('notes'),
            tags=','.join(data.get('tags', [])) if data.get('tags') else None,
            credit_limit=data.get('credit_limit', 0.0),
            payment_terms=data.get('payment_terms', 'Net 30'),
            tax_exempt=data.get('tax_exempt', False),
            service_area=data.get('service_area'),
            route_priority=data.get('route_priority', 0)
        )
        
        db.session.add(customer)
        db.session.commit()
        
        # Log customer creation
        history = CustomerHistory(
            customer_id=customer.id,
            user_id=current_user.id,
            action_type='created',
            description=f'Customer created by {current_user.first_name} {current_user.last_name}'
        )
        db.session.add(history)
        db.session.commit()
        
        return jsonify({
            'message': 'Customer created successfully',
            'customer': customer.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create customer: {str(e)}'}), 500

@customers_bp.route('/<int:customer_id>', methods=['PUT'])
@token_required
def update_customer(current_user, customer_id):
    try:
        customer = Customer.query.filter_by(
            id=customer_id, 
            company_id=current_user.company_id
        ).first()
        
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        updatable_fields = [
            'first_name', 'last_name', 'email', 'phone', 'mobile',
            'address', 'city', 'state', 'zip_code', 'country',
            'company_name', 'customer_type', 'status',
            'preferred_contact_method', 'notes', 'credit_limit',
            'payment_terms', 'tax_exempt', 'service_area', 'route_priority'
        ]
        
        changes = []
        for field in updatable_fields:
            if field in data:
                old_value = getattr(customer, field)
                new_value = data[field]
                
                if field == 'tags':
                    new_value = ','.join(new_value) if new_value else None
                
                if old_value != new_value:
                    setattr(customer, field, new_value)
                    changes.append(f'{field}: {old_value} → {new_value}')
        
        if changes:
            customer.updated_at = datetime.utcnow()
            db.session.commit()
            
            # Log customer update
            history = CustomerHistory(
                customer_id=customer.id,
                user_id=current_user.id,
                action_type='updated',
                description=f'Customer updated by {current_user.first_name} {current_user.last_name}',
                details=json.dumps(changes)
            )
            db.session.add(history)
            db.session.commit()
        
        return jsonify({
            'message': 'Customer updated successfully',
            'customer': customer.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update customer: {str(e)}'}), 500

@customers_bp.route('/<int:customer_id>', methods=['DELETE'])
@token_required
def delete_customer(current_user, customer_id):
    try:
        customer = Customer.query.filter_by(
            id=customer_id, 
            company_id=current_user.company_id
        ).first()
        
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        
        # Check if customer has active jobs or invoices
        if customer.jobs or customer.invoices:
            return jsonify({
                'message': 'Cannot delete customer with existing jobs or invoices. Set status to inactive instead.'
            }), 400
        
        # Log customer deletion
        history = CustomerHistory(
            customer_id=customer.id,
            user_id=current_user.id,
            action_type='deleted',
            description=f'Customer deleted by {current_user.first_name} {current_user.last_name}'
        )
        db.session.add(history)
        
        db.session.delete(customer)
        db.session.commit()
        
        return jsonify({'message': 'Customer deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete customer: {str(e)}'}), 500

@customers_bp.route('/<int:customer_id>/contacts', methods=['GET'])
@token_required
def get_customer_contacts(current_user, customer_id):
    try:
        customer = Customer.query.filter_by(
            id=customer_id, 
            company_id=current_user.company_id
        ).first()
        
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        
        contacts = CustomerContact.query.filter_by(customer_id=customer_id).all()
        
        return jsonify({
            'contacts': [contact.to_dict() for contact in contacts]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get contacts: {str(e)}'}), 500

@customers_bp.route('/<int:customer_id>/contacts', methods=['POST'])
@token_required
def create_customer_contact(current_user, customer_id):
    try:
        customer = Customer.query.filter_by(
            id=customer_id, 
            company_id=current_user.company_id
        ).first()
        
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'message': 'Contact name is required'}), 400
        
        contact = CustomerContact(
            customer_id=customer_id,
            name=data['name'],
            title=data.get('title'),
            email=data.get('email'),
            phone=data.get('phone'),
            mobile=data.get('mobile'),
            is_primary=data.get('is_primary', False),
            can_authorize_work=data.get('can_authorize_work', False),
            preferred_contact_method=data.get('preferred_contact_method', 'phone'),
            notes=data.get('notes')
        )
        
        db.session.add(contact)
        db.session.commit()
        
        # Log contact creation
        history = CustomerHistory(
            customer_id=customer_id,
            user_id=current_user.id,
            action_type='contact_added',
            description=f'Contact "{data["name"]}" added by {current_user.first_name} {current_user.last_name}'
        )
        db.session.add(history)
        db.session.commit()
        
        return jsonify({
            'message': 'Contact created successfully',
            'contact': contact.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create contact: {str(e)}'}), 500
@customers_bp.route('/<int:customer_id>/history', methods=['GET'])
@token_required
def get_customer_history(current_user, customer_id):
    try:
        customer = Customer.query.filter_by(
            id=customer_id, 
            company_id=current_user.company_id
        ).first()
        
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        history = CustomerHistory.query.filter_by(customer_id=customer_id)\
            .order_by(CustomerHistory.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'history': [entry.to_dict() for entry in history.items],
            'total': history.total,
            'pages': history.pages,
            'current_page': history.page,
            'has_next': history.has_next,
            'has_prev': history.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get customer history: {str(e)}'}), 500

@customers_bp.route('/stats', methods=['GET'])
@token_required
def get_customer_stats(current_user):
    try:
        total_customers = Customer.query.filter_by(company_id=current_user.company_id).count()
        active_customers = Customer.query.filter_by(
            company_id=current_user.company_id, 
            status='active'
        ).count()
        prospects = Customer.query.filter_by(
            company_id=current_user.company_id, 
            status='prospect'
        ).count()
        
        return jsonify({
            'total_customers': total_customers,
            'active_customers': active_customers,
            'prospects': prospects,
            'inactive_customers': total_customers - active_customers - prospects
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get customer stats: {str(e)}'}), 500

