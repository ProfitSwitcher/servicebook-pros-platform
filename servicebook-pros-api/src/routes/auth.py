from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from src.models.user import db, User
from src.models.company import Company

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Username and password are required'}), 400
        
        username = data.get('username')
        password = data.get('password')
        
        # Demo mode - allow demo_admin login
        if username == 'demo_admin' and password == 'demo123':
            # Create or get demo user
            demo_user = User.query.filter_by(username='demo_admin').first()
            if not demo_user:
                demo_user = User(
                    username='demo_admin',
                    email='demo@servicebookpros.com',
                    password_hash=generate_password_hash('demo123'),
                    first_name='Demo',
                    last_name='Admin',
                    role='admin'
                )
                db.session.add(demo_user)
                db.session.commit()
            
            # Create or get demo company
            demo_company = Company.query.filter_by(name='ServiceBook Pros Demo').first()
            if not demo_company:
                demo_company = Company(
                    name='ServiceBook Pros Demo',
                    email='demo@servicebookpros.com',
                    phone='(555) 123-4567',
                    address='123 Demo Street, Demo City, DC 12345'
                )
                db.session.add(demo_company)
                db.session.commit()
            
            # Generate token
            token = jwt.encode({
                'user_id': demo_user.id,
                'company_id': demo_company.id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, current_app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'access_token': token,
                'user': {
                    'id': demo_user.id,
                    'username': demo_user.username,
                    'email': demo_user.email,
                    'first_name': demo_user.first_name,
                    'last_name': demo_user.last_name,
                    'role': demo_user.role
                },
                'company': {
                    'id': demo_company.id,
                    'name': demo_company.name,
                    'email': demo_company.email,
                    'phone': demo_company.phone,
                    'address': demo_company.address
                }
            }), 200
        
        # Regular user authentication
        user = User.query.filter_by(username=username).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'message': 'Invalid username or password'}), 401
        
        # Get user's company
        company = Company.query.filter_by(id=user.company_id).first()
        
        # Generate token
        token = jwt.encode({
            'user_id': user.id,
            'company_id': user.company_id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'access_token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            },
            'company': {
                'id': company.id if company else None,
                'name': company.name if company else None,
                'email': company.email if company else None,
                'phone': company.phone if company else None,
                'address': company.address if company else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data.get('role', 'user')
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    # In a production system, you might want to blacklist the token
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    try:
        company = Company.query.filter_by(id=current_user.company_id).first()
        
        return jsonify({
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'role': current_user.role
            },
            'company': {
                'id': company.id if company else None,
                'name': company.name if company else None,
                'email': company.email if company else None,
                'phone': company.phone if company else None,
                'address': company.address if company else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get user info: {str(e)}'}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'message': 'Refresh token is required'}), 400
        
        try:
            # Decode the refresh token
            data = jwt.decode(refresh_token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            user = User.query.filter_by(id=data['user_id']).first()
            
            if not user:
                return jsonify({'message': 'Invalid refresh token'}), 401
            
            # Generate new access token
            new_token = jwt.encode({
                'user_id': user.id,
                'company_id': user.company_id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, current_app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'access_token': new_token
            }), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Refresh token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid refresh token'}), 401
            
    except Exception as e:
        return jsonify({'message': f'Token refresh failed: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    try:
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'message': 'Current password and new password are required'}), 400
        
        # Verify current password
        if not check_password_hash(current_user.password_hash, data['current_password']):
            return jsonify({'message': 'Current password is incorrect'}), 400
        
        # Update password
        current_user.password_hash = generate_password_hash(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Password change failed: {str(e)}'}), 500

