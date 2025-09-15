from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.company import Company
from src.models.pricing import (
    ServiceCategory, ServiceSubcategory, MasterService, 
    CompanyService, CompanyTaxRate, CompanyLaborRate
)
from src.routes.auth import require_auth, require_admin, get_current_company
from datetime import datetime
from sqlalchemy import or_, and_

pricing_bp = Blueprint('pricing', __name__, url_prefix='/api/pricing')

# ===== MASTER CATALOG ROUTES (READ-ONLY FOR COMPANIES) =====

@pricing_bp.route('/categories', methods=['GET'])
@require_auth
def get_categories():
    """Get all service categories"""
    try:
        categories = ServiceCategory.query.filter_by(is_active=True).order_by(ServiceCategory.sort_order).all()
        
        # Add service counts for each category
        result = []
        for category in categories:
            category_dict = category.to_dict()
            category_dict['service_count'] = MasterService.query.filter_by(
                category_code=category.category_code, 
                is_active=True
            ).count()
            result.append(category_dict)
        
        return jsonify({
            'success': True,
            'categories': result,
            'total': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@pricing_bp.route('/categories/<category_code>/subcategories', methods=['GET'])
@require_auth
def get_subcategories(category_code):
    """Get subcategories for a category"""
    try:
        subcategories = ServiceSubcategory.query.filter_by(
            category_code=category_code, 
            is_active=True
        ).order_by(ServiceSubcategory.sort_order).all()
        
        # Add service counts for each subcategory
        result = []
        for subcategory in subcategories:
            subcategory_dict = subcategory.to_dict()
            subcategory_dict['service_count'] = MasterService.query.filter_by(
                subcategory_code=subcategory.subcategory_code, 
                is_active=True
            ).count()
            result.append(subcategory_dict)
        
        return jsonify({
            'success': True,
            'subcategories': result,
            'total': len(result)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@pricing_bp.route('/services', methods=['GET'])
@require_auth
def get_company_services():
    """Get company's customized services with pricing"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        # Get query parameters
        category_code = request.args.get('category')
        subcategory_code = request.args.get('subcategory')
        search = request.args.get('search', '').strip()
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 20)), 100)
        
        # Build query for master services
        query = MasterService.query.filter_by(is_active=True)
        
        if category_code:
            query = query.filter_by(category_code=category_code)
        
        if subcategory_code:
            query = query.filter_by(subcategory_code=subcategory_code)
        
        if search:
            search_term = f'%{search}%'
            query = query.filter(or_(
                MasterService.service_name.ilike(search_term),
                MasterService.description.ilike(search_term),
                MasterService.service_code.ilike(search_term)
            ))
        
        # Paginate
        pagination = query.order_by(MasterService.sort_order, MasterService.service_name).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Get company customizations
        service_codes = [service.service_code for service in pagination.items]
        company_customizations = {
            cs.service_code: cs for cs in CompanyService.query.filter(
                CompanyService.company_id == company.id,
                CompanyService.service_code.in_(service_codes)
            ).all()
        }
        
        # Build response with effective pricing
        services = []
        for master_service in pagination.items:
            company_service = company_customizations.get(master_service.service_code)
            
            if company_service:
                # Use company customization
                service_dict = company_service.to_dict(company.default_labor_rate)
            else:
                # Use master service with company labor rate
                labor_hours = float(master_service.base_labor_hours or 1.0)
                material_cost = float(master_service.base_material_cost or 0.0)
                labor_rate = float(company.default_labor_rate or 150.0)
                effective_price = (labor_hours * labor_rate) + material_cost
                
                service_dict = master_service.to_dict()
                service_dict.update({
                    'effective_price': round(effective_price, 2),
                    'is_customized': False,
                    'company_labor_rate': labor_rate
                })
            
            services.append(service_dict)
        
        return jsonify({
            'success': True,
            'services': services,
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== COMPANY SERVICE CUSTOMIZATION =====

@pricing_bp.route('/services/<service_code>', methods=['GET'])
@require_auth
def get_company_service(service_code):
    """Get specific service with company pricing"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        # Get master service
        master_service = MasterService.query.filter_by(service_code=service_code, is_active=True).first()
        if not master_service:
            return jsonify({'success': False, 'message': 'Service not found'}), 404
        
        # Get company customization
        company_service = CompanyService.query.filter_by(
            company_id=company.id,
            service_code=service_code
        ).first()
        
        if company_service:
            service_dict = company_service.to_dict(company.default_labor_rate)
        else:
            # Return master service with calculated pricing
            labor_hours = float(master_service.base_labor_hours or 1.0)
            material_cost = float(master_service.base_material_cost or 0.0)
            labor_rate = float(company.default_labor_rate or 150.0)
            effective_price = (labor_hours * labor_rate) + material_cost
            
            service_dict = master_service.to_dict()
            service_dict.update({
                'effective_price': round(effective_price, 2),
                'is_customized': False,
                'company_labor_rate': labor_rate
            })
        
        return jsonify({
            'success': True,
            'service': service_dict
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@pricing_bp.route('/services/<service_code>', methods=['PUT'])
@require_auth
def update_company_service(service_code):
    """Update company-specific service pricing"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        # Verify master service exists
        master_service = MasterService.query.filter_by(service_code=service_code, is_active=True).first()
        if not master_service:
            return jsonify({'success': False, 'message': 'Service not found'}), 404
        
        data = request.get_json()
        
        # Get or create company service customization
        company_service = CompanyService.query.filter_by(
            company_id=company.id,
            service_code=service_code
        ).first()
        
        if not company_service:
            company_service = CompanyService(
                company_id=company.id,
                service_code=service_code
            )
            db.session.add(company_service)
        
        # Update allowed fields
        allowed_fields = [
            'custom_price', 'custom_labor_hours', 'custom_material_cost',
            'price_adjustment_percent', 'price_adjustment_amount',
            'custom_name', 'custom_description', 'is_active', 'is_hidden'
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(company_service, field, data[field])
        
        company_service.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Service pricing updated successfully',
            'service': company_service.to_dict(company.default_labor_rate)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@pricing_bp.route('/services/<service_code>/reset', methods=['POST'])
@require_auth
def reset_company_service(service_code):
    """Reset service to master pricing (remove customization)"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        # Find and delete company customization
        company_service = CompanyService.query.filter_by(
            company_id=company.id,
            service_code=service_code
        ).first()
        
        if company_service:
            db.session.delete(company_service)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Service reset to master pricing'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== BULK PRICING OPERATIONS =====

@pricing_bp.route('/services/bulk-adjust', methods=['POST'])
@require_auth
def bulk_adjust_pricing():
    """Apply bulk pricing adjustments to multiple services"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('adjustment_type') or not data.get('adjustment_value'):
            return jsonify({'success': False, 'message': 'Adjustment type and value required'}), 400
        
        adjustment_type = data['adjustment_type']  # 'percent' or 'amount'
        adjustment_value = float(data['adjustment_value'])
        service_codes = data.get('service_codes', [])  # If empty, apply to all
        category_codes = data.get('category_codes', [])
        
        # Build query for services to adjust
        query = MasterService.query.filter_by(is_active=True)
        
        if service_codes:
            query = query.filter(MasterService.service_code.in_(service_codes))
        elif category_codes:
            query = query.filter(MasterService.category_code.in_(category_codes))
        
        services_to_adjust = query.all()
        updated_count = 0
        
        for master_service in services_to_adjust:
            # Get or create company service
            company_service = CompanyService.query.filter_by(
                company_id=company.id,
                service_code=master_service.service_code
            ).first()
            
            if not company_service:
                company_service = CompanyService(
                    company_id=company.id,
                    service_code=master_service.service_code
                )
                db.session.add(company_service)
            
            # Apply adjustment
            if adjustment_type == 'percent':
                company_service.price_adjustment_percent = adjustment_value
                company_service.price_adjustment_amount = 0.0
            else:  # amount
                company_service.price_adjustment_amount = adjustment_value
                company_service.price_adjustment_percent = 0.0
            
            company_service.updated_at = datetime.utcnow()
            updated_count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Bulk adjustment applied to {updated_count} services',
            'updated_count': updated_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== TAX RATES MANAGEMENT =====

@pricing_bp.route('/tax-rates', methods=['GET'])
@require_auth
def get_company_tax_rates():
    """Get company tax rates"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        tax_rates = CompanyTaxRate.query.filter_by(
            company_id=company.id, 
            is_active=True
        ).order_by(CompanyTaxRate.is_default.desc(), CompanyTaxRate.tax_name).all()
        
        return jsonify({
            'success': True,
            'tax_rates': [rate.to_dict() for rate in tax_rates],
            'total': len(tax_rates)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@pricing_bp.route('/tax-rates', methods=['POST'])
@require_auth
def create_company_tax_rate():
    """Create new company tax rate"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        data = request.get_json()
        
        if not data.get('tax_name') or not data.get('tax_rate'):
            return jsonify({'success': False, 'message': 'Tax name and rate required'}), 400
        
        # If this is set as default, unset other defaults
        if data.get('is_default'):
            CompanyTaxRate.query.filter_by(company_id=company.id).update({'is_default': False})
        
        tax_rate = CompanyTaxRate(
            company_id=company.id,
            tax_name=data['tax_name'],
            tax_rate=float(data['tax_rate']) / 100 if float(data['tax_rate']) > 1 else float(data['tax_rate']),  # Convert percentage
            is_default=data.get('is_default', False)
        )
        
        db.session.add(tax_rate)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Tax rate created successfully',
            'tax_rate': tax_rate.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== LABOR RATES MANAGEMENT =====

@pricing_bp.route('/labor-rates', methods=['GET'])
@require_auth
def get_company_labor_rates():
    """Get company labor rates"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        labor_rates = CompanyLaborRate.query.filter_by(
            company_id=company.id, 
            is_active=True
        ).order_by(CompanyLaborRate.is_default.desc(), CompanyLaborRate.rate_name).all()
        
        return jsonify({
            'success': True,
            'labor_rates': [rate.to_dict() for rate in labor_rates],
            'total': len(labor_rates)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@pricing_bp.route('/labor-rates', methods=['POST'])
@require_auth
def create_company_labor_rate():
    """Create new company labor rate"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        data = request.get_json()
        
        required_fields = ['rate_name', 'hourly_cost', 'hourly_price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'{field} is required'}), 400
        
        # If this is set as default, unset other defaults and update company default
        if data.get('is_default'):
            CompanyLaborRate.query.filter_by(company_id=company.id).update({'is_default': False})
            company.default_labor_rate = data['hourly_price']
        
        labor_rate = CompanyLaborRate(
            company_id=company.id,
            rate_name=data['rate_name'],
            hourly_cost=data['hourly_cost'],
            hourly_price=data['hourly_price'],
            is_default=data.get('is_default', False)
        )
        
        db.session.add(labor_rate)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Labor rate created successfully',
            'labor_rate': labor_rate.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@pricing_bp.route('/labor-rates/<int:rate_id>', methods=['PUT'])
@require_auth
def update_company_labor_rate(rate_id):
    """Update company labor rate"""
    try:
        company = get_current_company()
        if not company:
            return jsonify({'success': False, 'message': 'No company found'}), 404
        
        labor_rate = CompanyLaborRate.query.filter_by(
            id=rate_id, 
            company_id=company.id
        ).first()
        
        if not labor_rate:
            return jsonify({'success': False, 'message': 'Labor rate not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        allowed_fields = ['rate_name', 'hourly_cost', 'hourly_price', 'is_default', 'is_active']
        for field in allowed_fields:
            if field in data:
                setattr(labor_rate, field, data[field])
        
        # If this is set as default, unset other defaults and update company default
        if data.get('is_default'):
            CompanyLaborRate.query.filter_by(company_id=company.id).update({'is_default': False})
            labor_rate.is_default = True
            company.default_labor_rate = labor_rate.hourly_price
        
        labor_rate.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Labor rate updated successfully',
            'labor_rate': labor_rate.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

