from flask import Blueprint, request, jsonify, session
from src.models.user import db, User
from src.models.company import Company, CompanyUser
from datetime import datetime
import secrets
import string

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def generate_company_code():
    """Generate a unique company code"""
    while True:
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        if not Company.query.filter_by(company_code=code).first():
            return code

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new company and admin user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'company_name', 'contact_email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'{field} is required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'message': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already exists'}), 400
        
        # Create company
        company = Company(
            company_name=data['company_name'],
            company_code=generate_company_code(),
            contact_email=data['contact_email'],
            contact_phone=data.get('contact_phone', ''),
            address=data.get('address', ''),
            city=data.get('city', ''),
            state=data.get('state', ''),
            zip_code=data.get('zip_code', ''),
            default_labor_rate=data.get('default_labor_rate', 150.00),
            default_tax_rate=data.get('default_tax_rate', 0.0875)
        )
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            user_type='company_user',
            is_verified=True  # Auto-verify for now
        )
        user.set_password(data['password'])
        
        # Save to database
        db.session.add(company)
        db.session.add(user)
        db.session.flush()  # Get IDs
        
        # Create company-user association with admin role
        company_user = CompanyUser(
            user_id=user.id,
            company_id=company.id,
            role='admin'
        )
        db.session.add(company_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company and user registered successfully',
            'company_code': company.company_code,
            'user_id': user.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'success': False, 'message': 'Username and password required'}), 400
        
        # Find user
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'success': False, 'message': 'Account is deactivated'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Store user info in session
        session['user_id'] = user.id
        session['username'] = user.username
        session['user_type'] = user.user_type
        
        # Get user's companies
        companies = user.get_companies()
        primary_company = user.get_primary_company()
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'companies': [company.to_dict() for company in companies],
            'primary_company': primary_company.to_dict() if primary_company else None
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user info"""
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        companies = user.get_companies()
        primary_company = user.get_primary_company()
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'companies': [company.to_dict() for company in companies],
            'primary_company': primary_company.to_dict() if primary_company else None
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@auth_bp.route('/create-admin', methods=['POST'])
def create_admin():
    """Create system admin user (for initial setup)"""
    try:
        data = request.get_json()
        
        # Check if admin already exists
        if User.query.filter_by(user_type='admin').first():
            return jsonify({'success': False, 'message': 'Admin user already exists'}), 400
        
        # Create admin user
        admin = User(
            username=data.get('username', 'admin'),
            email=data.get('email', 'admin@servicebookpros.com'),
            first_name='System',
            last_name='Administrator',
            user_type='admin',
            is_verified=True
        )
        admin.set_password(data.get('password', 'admin123'))
        
        db.session.add(admin)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Admin user created successfully',
            'admin_id': admin.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

def require_auth(f):
    """Decorator to require authentication"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def require_admin(f):
    """Decorator to require admin privileges"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or not user.is_admin():
            return jsonify({'success': False, 'message': 'Admin privileges required'}), 403
        
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def get_current_company():
    """Get current user's company"""
    if 'user_id' not in session:
        return None
    
    user = User.query.get(session['user_id'])
    return user.get_primary_company() if user else None

