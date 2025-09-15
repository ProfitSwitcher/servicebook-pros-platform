"""
Materials management API routes for ServiceBook Pros
"""

from flask import Blueprint, request, jsonify, session
from src.models.user import db
from src.models.materials import MaterialCategory, MaterialSubcategory, MasterMaterial, CompanyMaterial
from src.models.company import Company, CompanyUser
from functools import wraps

materials_bp = Blueprint('materials', __name__, url_prefix='/api/materials')

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def get_user_company():
    """Get the current user's company"""
    if 'user_id' not in session:
        return None
    
    user_id = session['user_id']
    company_user = CompanyUser.query.filter_by(user_id=user_id, is_active=True).first()
    if company_user:
        return Company.query.get(company_user.company_id)
    return None

@materials_bp.route('/categories', methods=['GET'])
@require_auth
def get_categories():
    """Get all material categories"""
    try:
        categories = MaterialCategory.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'categories': [cat.to_dict() for cat in categories]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@materials_bp.route('/subcategories', methods=['GET'])
@require_auth
def get_subcategories():
    """Get subcategories, optionally filtered by category"""
    try:
        category_code = request.args.get('category_code')
        
        query = MaterialSubcategory.query.filter_by(is_active=True)
        if category_code:
            query = query.filter_by(category_code=category_code)
        
        subcategories = query.all()
        return jsonify({
            'success': True,
            'subcategories': [subcat.to_dict() for subcat in subcategories]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@materials_bp.route('/catalog', methods=['GET'])
@require_auth
def get_materials_catalog():
    """Get materials catalog with optional filtering"""
    try:
        # Get query parameters
        category_code = request.args.get('category_code')
        subcategory_code = request.args.get('subcategory_code')
        search_term = request.args.get('search', '')
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 50)), 100)
        
        # Build query
        query = MasterMaterial.query.filter_by(is_active=True)
        
        if category_code:
            query = query.filter_by(category_code=category_code)
        
        if subcategory_code:
            query = query.filter_by(subcategory_code=subcategory_code)
        
        if search_term:
            search_pattern = f"%{search_term}%"
            query = query.filter(
                db.or_(
                    MasterMaterial.material_name.ilike(search_pattern),
                    MasterMaterial.description.ilike(search_pattern),
                    MasterMaterial.material_code.ilike(search_pattern)
                )
            )
        
        # Get paginated results
        materials = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'materials': [material.to_dict() for material in materials.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': materials.total,
                'pages': materials.pages,
                'has_next': materials.has_next,
                'has_prev': materials.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@materials_bp.route('/company', methods=['GET'])
@require_auth
def get_company_materials():
    """Get company-specific material pricing"""
    try:
        company = get_user_company()
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        # Get query parameters
        category_code = request.args.get('category_code')
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 50)), 100)
        
        # Build query for company materials with master material data
        query = db.session.query(CompanyMaterial).join(MasterMaterial).filter(
            CompanyMaterial.company_id == company.id,
            CompanyMaterial.is_active == True,
            MasterMaterial.is_active == True
        )
        
        if category_code:
            query = query.filter(MasterMaterial.category_code == category_code)
        
        # Get paginated results
        company_materials = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'materials': [material.to_dict() for material in company_materials.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': company_materials.total,
                'pages': company_materials.pages,
                'has_next': company_materials.has_next,
                'has_prev': company_materials.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@materials_bp.route('/company', methods=['POST'])
@require_auth
def add_company_material():
    """Add or update company-specific material pricing"""
    try:
        company = get_user_company()
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        data = request.get_json()
        material_code = data.get('material_code')
        
        if not material_code:
            return jsonify({'success': False, 'message': 'Material code is required'}), 400
        
        # Check if master material exists
        master_material = MasterMaterial.query.filter_by(material_code=material_code).first()
        if not master_material:
            return jsonify({'success': False, 'message': 'Master material not found'}), 404
        
        # Check if company material already exists
        company_material = CompanyMaterial.query.filter_by(
            company_id=company.id,
            material_code=material_code
        ).first()
        
        if company_material:
            # Update existing
            company_material.custom_cost = data.get('custom_cost')
            company_material.markup_percentage = data.get('markup_percentage', 0.0)
            company_material.preferred_supplier = data.get('preferred_supplier')
            company_material.notes = data.get('notes')
            company_material.is_active = data.get('is_active', True)
        else:
            # Create new
            company_material = CompanyMaterial(
                company_id=company.id,
                material_code=material_code,
                custom_cost=data.get('custom_cost'),
                markup_percentage=data.get('markup_percentage', 0.0),
                preferred_supplier=data.get('preferred_supplier'),
                notes=data.get('notes'),
                is_active=data.get('is_active', True)
            )
            db.session.add(company_material)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company material updated successfully',
            'material': company_material.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@materials_bp.route('/company/<int:material_id>', methods=['PUT'])
@require_auth
def update_company_material(material_id):
    """Update company-specific material pricing"""
    try:
        company = get_user_company()
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        company_material = CompanyMaterial.query.filter_by(
            id=material_id,
            company_id=company.id
        ).first()
        
        if not company_material:
            return jsonify({'success': False, 'message': 'Company material not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'custom_cost' in data:
            company_material.custom_cost = data['custom_cost']
        if 'markup_percentage' in data:
            company_material.markup_percentage = data['markup_percentage']
        if 'preferred_supplier' in data:
            company_material.preferred_supplier = data['preferred_supplier']
        if 'notes' in data:
            company_material.notes = data['notes']
        if 'is_active' in data:
            company_material.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company material updated successfully',
            'material': company_material.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@materials_bp.route('/company/<int:material_id>', methods=['DELETE'])
@require_auth
def delete_company_material(material_id):
    """Delete (deactivate) company-specific material"""
    try:
        company = get_user_company()
        if not company:
            return jsonify({'success': False, 'message': 'Company not found'}), 404
        
        company_material = CompanyMaterial.query.filter_by(
            id=material_id,
            company_id=company.id
        ).first()
        
        if not company_material:
            return jsonify({'success': False, 'message': 'Company material not found'}), 404
        
        # Soft delete by setting is_active to False
        company_material.is_active = False
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company material deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

