from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.company import Company, CompanyUser
from src.routes.auth import require_auth, require_admin, get_current_company
from datetime import datetime

company_bp = Blueprint('company', __name__, url_prefix='/api/companies')

@company_bp.route('/', methods=['GET'])
@require_admin
def get_all_companies():
    """Get all companies (admin only)"""
    try:
        companies = Company.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'companies': [company.to_dict() for company in companies],
            'total': len(companies)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@company_bp.route('/my-company', methods=['GET'])
@require_auth
def get_my_company():
    """Get current user's company"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        return jsonify({
            'success': True,
            'company': company.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@company_bp.route('/my-company', methods=['PUT'])
@require_auth
def update_my_company():
    """Update current user's company"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = [
            'company_name', 'contact_email', 'contact_phone', 'address',
            'city', 'state', 'zip_code', 'default_labor_rate', 'default_tax_rate'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(company, field, data[field])
        
        company.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company updated successfully',
            'company': company.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@company_bp.route('/<int:company_id>', methods=['GET'])
@require_admin
def get_company(company_id):
    """Get specific company (admin only)"""
    try:
        company = Company.query.get(company_id)
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        return jsonify({
            'success': True,
            'company': company.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@company_bp.route('/<int:company_id>', methods=['PUT'])
@require_admin
def update_company(company_id):
    """Update specific company (admin only)"""
    try:
        company = Company.query.get(company_id)
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = [
            'company_name', 'contact_email', 'contact_phone', 'address',
            'city', 'state', 'zip_code', 'subscription_plan', 'subscription_status',
            'default_labor_rate', 'default_tax_rate', 'is_active'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(company, field, data[field])
        
        company.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company updated successfully',
            'company': company.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@company_bp.route('/my-company/users', methods=['GET'])
@require_auth
def get_company_users():
    """Get users in current company"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        company_users = CompanyUser.query.filter_by(
            company_id=company.id, 
            is_active=True
        ).all()
        
        return jsonify({
            'success': True,
            'users': [cu.to_dict() for cu in company_users],
            'total': len(company_users)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@company_bp.route('/my-company/users', methods=['POST'])
@require_auth
def add_company_user():
    """Add user to current company"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        data = request.get_json()
        
        # Check if user exists
        user = User.query.filter_by(email=data.get('email')).first()
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Check if user is already in company
        existing = CompanyUser.query.filter_by(
            user_id=user.id, 
            company_id=company.id
        ).first()
        
        if existing:
            if existing.is_active:
                return jsonify({'success': False, 'message': 'User already in company'}), 400
            else:
                # Reactivate user
                existing.is_active = True
                existing.role = data.get('role', 'user')
        else:
            # Create new association
            company_user = CompanyUser(
                user_id=user.id,
                company_id=company.id,
                role=data.get('role', 'user')
            )
            db.session.add(company_user)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User added to company successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@company_bp.route('/stats', methods=['GET'])
@require_admin
def get_company_stats():
    """Get company statistics (admin only)"""
    try:
        total_companies = Company.query.filter_by(is_active=True).count()
        active_subscriptions = Company.query.filter_by(
            is_active=True, 
            subscription_status='active'
        ).count()
        trial_companies = Company.query.filter(
            Company.trial_end_date.isnot(None),
            Company.trial_end_date > datetime.utcnow()
        ).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_companies': total_companies,
                'active_subscriptions': active_subscriptions,
                'trial_companies': trial_companies,
                'conversion_rate': (active_subscriptions / total_companies * 100) if total_companies > 0 else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

