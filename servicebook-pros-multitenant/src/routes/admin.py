"""
Admin panel API routes for ServiceBook Pros
System-wide management for administrators
"""

from flask import Blueprint, request, jsonify, session
from src.models.user import db, User
from src.models.company import Company, CompanyUser
from src.models.pricing import ServiceCategory, MasterService
from src.models.materials import MaterialCategory, MasterMaterial
from functools import wraps
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def require_admin(f):
    """Decorator to require admin authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or user.user_type != 'admin':
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/dashboard', methods=['GET'])
@require_admin
def get_admin_dashboard():
    """Get admin dashboard statistics"""
    try:
        # Get system statistics
        total_companies = Company.query.count()
        active_companies = Company.query.filter_by(is_active=True).count()
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        total_services = MasterService.query.count()
        total_materials = MasterMaterial.query.count()
        
        # Get recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_companies = Company.query.filter(Company.created_at >= thirty_days_ago).count()
        recent_users = User.query.filter(User.created_at >= thirty_days_ago).count()
        
        # Get user login stats
        recent_logins = User.query.filter(
            User.last_login >= thirty_days_ago,
            User.last_login.isnot(None)
        ).count()
        
        return jsonify({
            'success': True,
            'dashboard': {
                'companies': {
                    'total': total_companies,
                    'active': active_companies,
                    'recent': recent_companies
                },
                'users': {
                    'total': total_users,
                    'active': active_users,
                    'recent': recent_users,
                    'recent_logins': recent_logins
                },
                'catalog': {
                    'services': total_services,
                    'materials': total_materials
                }
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/companies', methods=['GET'])
@require_admin
def get_all_companies():
    """Get all companies with pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 100)
        search_term = request.args.get('search', '')
        
        query = Company.query
        
        if search_term:
            search_pattern = f"%{search_term}%"
            query = query.filter(
                db.or_(
                    Company.company_name.ilike(search_pattern),
                    Company.company_code.ilike(search_pattern),
                    Company.contact_email.ilike(search_pattern)
                )
            )
        
        companies = query.order_by(Company.created_at.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Get user counts for each company
        company_data = []
        for company in companies.items:
            user_count = CompanyUser.query.filter_by(
                company_id=company.id, 
                is_active=True
            ).count()
            
            company_dict = company.to_dict()
            company_dict['user_count'] = user_count
            company_data.append(company_dict)
        
        return jsonify({
            'success': True,
            'companies': company_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': companies.total,
                'pages': companies.pages,
                'has_next': companies.has_next,
                'has_prev': companies.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/companies', methods=['POST'])
@require_admin
def create_company():
    """Create a new company"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['company_name', 'company_code', 'contact_email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'{field} is required'}), 400
        
        # Check if company code already exists
        existing_company = Company.query.filter_by(company_code=data['company_code']).first()
        if existing_company:
            return jsonify({'success': False, 'message': 'Company code already exists'}), 400
        
        # Create new company
        company = Company(
            company_name=data['company_name'],
            company_code=data['company_code'],
            contact_email=data['contact_email'],
            contact_phone=data.get('contact_phone'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            zip_code=data.get('zip_code'),
            default_labor_rate=data.get('default_labor_rate', 150.0),
            default_tax_rate=data.get('default_tax_rate', 0.08),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(company)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company created successfully',
            'company': company.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/companies/<int:company_id>', methods=['PUT'])
@require_admin
def update_company(company_id):
    """Update a company"""
    try:
        company = Company.query.get(company_id)
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        updatable_fields = [
            'company_name', 'contact_email', 'contact_phone', 'address',
            'city', 'state', 'zip_code', 'default_labor_rate', 
            'default_tax_rate', 'is_active'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(company, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company updated successfully',
            'company': company.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/companies/<int:company_id>', methods=['DELETE'])
@require_admin
def delete_company(company_id):
    """Delete (deactivate) a company"""
    try:
        company = Company.query.get(company_id)
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        # Soft delete by setting is_active to False
        company.is_active = False
        
        # Also deactivate all company users
        CompanyUser.query.filter_by(company_id=company_id).update({'is_active': False})
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@require_admin
def get_all_users():
    """Get all users with pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 100)
        search_term = request.args.get('search', '')
        user_type = request.args.get('user_type')
        
        query = User.query
        
        if search_term:
            search_pattern = f"%{search_term}%"
            query = query.filter(
                db.or_(
                    User.username.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    User.first_name.ilike(search_pattern),
                    User.last_name.ilike(search_pattern)
                )
            )
        
        if user_type:
            query = query.filter_by(user_type=user_type)
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Get company information for each user
        user_data = []
        for user in users.items:
            user_dict = user.to_dict()
            
            # Get company associations
            company_users = CompanyUser.query.filter_by(user_id=user.id).all()
            companies = []
            for cu in company_users:
                company = Company.query.get(cu.company_id)
                if company:
                    companies.append({
                        'company_id': company.id,
                        'company_name': company.company_name,
                        'company_code': company.company_code,
                        'role': cu.role,
                        'is_active': cu.is_active
                    })
            
            user_dict['companies'] = companies
            user_data.append(user_dict)
        
        return jsonify({
            'success': True,
            'users': user_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users.total,
                'pages': users.pages,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/toggle-active', methods=['PUT'])
@require_admin
def toggle_user_active(user_id):
    """Toggle user active status"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/system/settings', methods=['GET'])
@require_admin
def get_system_settings():
    """Get system-wide settings"""
    try:
        # For now, return basic system information
        # In a real implementation, you might have a settings table
        settings = {
            'platform_name': 'ServiceBook Pros',
            'version': '1.0.0',
            'default_labor_rate': 150.0,
            'default_tax_rate': 0.08,
            'max_companies': 1000,
            'max_users_per_company': 50,
            'features': {
                'materials_catalog': True,
                'multi_tenant': True,
                'custom_pricing': True,
                'reporting': True
            }
        }
        
        return jsonify({
            'success': True,
            'settings': settings
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/system/backup', methods=['POST'])
@require_admin
def create_system_backup():
    """Create a system backup (placeholder)"""
    try:
        # This is a placeholder for backup functionality
        # In a real implementation, you would backup the database
        backup_info = {
            'backup_id': f"backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            'created_at': datetime.utcnow().isoformat(),
            'status': 'completed',
            'size': '2.5MB',  # Placeholder
            'tables_backed_up': [
                'users', 'companies', 'company_users', 'service_categories',
                'master_services', 'company_services', 'material_categories',
                'master_materials', 'company_materials'
            ]
        }
        
        return jsonify({
            'success': True,
            'message': 'System backup created successfully',
            'backup': backup_info
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

