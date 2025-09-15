from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.pricing import (
    FlatRatePricingItem, PricingTemplate, CompanyPricingSettings, 
    PricingHistory, ServiceCategory, PricingTier
)
from src.routes.auth import token_required
from datetime import datetime
import json

pricing_bp = Blueprint('pricing', __name__)

@pricing_bp.route('/pricing/items', methods=['GET'])
@token_required
def get_pricing_items(current_user):
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        category = request.args.get('category', '')
        search = request.args.get('search', '')
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        
        # Build query
        query = FlatRatePricingItem.query.filter_by(company_id=current_user.company_id)
        
        # Apply filters
        if active_only:
            query = query.filter_by(is_active=True)
            
        if category:
            query = query.filter_by(category=ServiceCategory(category))
            
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    FlatRatePricingItem.title.ilike(search_term),
                    FlatRatePricingItem.description.ilike(search_term),
                    FlatRatePricingItem.item_code.ilike(search_term),
                    FlatRatePricingItem.keywords.ilike(search_term)
                )
            )
        
        # Order by category and title
        query = query.order_by(FlatRatePricingItem.category, FlatRatePricingItem.title)
        
        # Paginate
        items = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'pricing_items': [item.to_dict() for item in items.items],
            'total': items.total,
            'pages': items.pages,
            'current_page': items.page,
            'per_page': items.per_page,
            'has_next': items.has_next,
            'has_prev': items.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get pricing items: {str(e)}'}), 500

@pricing_bp.route('/pricing/items/<int:item_id>', methods=['GET'])
@token_required
def get_pricing_item(current_user, item_id):
    try:
        item = FlatRatePricingItem.query.filter_by(
            id=item_id, 
            company_id=current_user.company_id
        ).first()
        
        if not item:
            return jsonify({'message': 'Pricing item not found'}), 404
        
        return jsonify(item.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get pricing item: {str(e)}'}), 500

@pricing_bp.route('/pricing/items', methods=['POST'])
@token_required
def create_pricing_item(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['item_code', 'title', 'description', 'category', 'good_price', 'better_price', 'best_price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if item code already exists for this company
        existing_item = FlatRatePricingItem.query.filter_by(
            company_id=current_user.company_id,
            item_code=data['item_code']
        ).first()
        
        if existing_item:
            return jsonify({'message': 'Item code already exists'}), 400
        
        # Create pricing item
        item = FlatRatePricingItem(
            company_id=current_user.company_id,
            item_code=data['item_code'],
            title=data['title'],
            description=data['description'],
            category=ServiceCategory(data['category']),
            subcategory=data.get('subcategory'),
            good_price=data['good_price'],
            better_price=data['better_price'],
            best_price=data['best_price'],
            labor_hours=data.get('labor_hours', 0.0),
            base_labor_rate=data.get('base_labor_rate', 75.0),
            material_cost=data.get('material_cost', 0.0),
            markup_percentage=data.get('markup_percentage', 20.0),
            warranty_included=data.get('warranty_included', True),
            warranty_period_months=data.get('warranty_period_months', 12),
            is_active=data.get('is_active', True),
            is_emergency=data.get('is_emergency', False),
            difficulty_level=data.get('difficulty_level', 1),
            tags=json.dumps(data.get('tags', [])),
            keywords=data.get('keywords', '')
        )
        
        db.session.add(item)
        db.session.commit()
        
        return jsonify({
            'message': 'Pricing item created successfully',
            'pricing_item': item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create pricing item: {str(e)}'}), 500

@pricing_bp.route('/pricing/items/<int:item_id>', methods=['PUT'])
@token_required
def update_pricing_item(current_user, item_id):
    try:
        item = FlatRatePricingItem.query.filter_by(
            id=item_id, 
            company_id=current_user.company_id
        ).first()
        
        if not item:
            return jsonify({'message': 'Pricing item not found'}), 404
        
        data = request.get_json()
        
        # Store old prices for history
        old_prices = {
            'good_price': item.good_price,
            'better_price': item.better_price,
            'best_price': item.best_price
        }
        
        # Update fields
        updatable_fields = [
            'title', 'description', 'subcategory', 'good_price', 'better_price', 'best_price',
            'labor_hours', 'base_labor_rate', 'material_cost', 'markup_percentage',
            'warranty_included', 'warranty_period_months', 'is_active', 'is_emergency',
            'difficulty_level', 'keywords'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == 'tags':
                    setattr(item, field, json.dumps(data[field]))
                elif field == 'category':
                    setattr(item, field, ServiceCategory(data[field]))
                else:
                    setattr(item, field, data[field])
        
        # Check if prices changed and create history record
        price_changed = (
            old_prices['good_price'] != item.good_price or
            old_prices['better_price'] != item.better_price or
            old_prices['best_price'] != item.best_price
        )
        
        if price_changed:
            history = PricingHistory(
                company_id=current_user.company_id,
                pricing_item_id=item.id,
                old_good_price=old_prices['good_price'],
                old_better_price=old_prices['better_price'],
                old_best_price=old_prices['best_price'],
                new_good_price=item.good_price,
                new_better_price=item.better_price,
                new_best_price=item.best_price,
                change_reason=data.get('change_reason', 'Manual update'),
                changed_by_user_id=current_user.id
            )
            db.session.add(history)
        
        item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Pricing item updated successfully',
            'pricing_item': item.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update pricing item: {str(e)}'}), 500

@pricing_bp.route('/pricing/settings', methods=['GET'])
@token_required
def get_pricing_settings(current_user):
    try:
        settings = CompanyPricingSettings.query.filter_by(
            company_id=current_user.company_id
        ).first()
        
        if not settings:
            # Create default settings
            settings = CompanyPricingSettings(company_id=current_user.company_id)
            db.session.add(settings)
            db.session.commit()
        
        return jsonify(settings.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get pricing settings: {str(e)}'}), 500

@pricing_bp.route('/pricing/settings', methods=['PUT'])
@token_required
def update_pricing_settings(current_user):
    try:
        settings = CompanyPricingSettings.query.filter_by(
            company_id=current_user.company_id
        ).first()
        
        if not settings:
            settings = CompanyPricingSettings(company_id=current_user.company_id)
            db.session.add(settings)
        
        data = request.get_json()
        
        # Store old labor rate for potential bulk update
        old_labor_rate = settings.global_labor_rate
        
        # Update settings
        updatable_fields = [
            'global_labor_rate', 'default_material_markup', 'emergency_surcharge_percentage',
            'show_good_tier', 'show_better_tier', 'show_best_tier',
            'good_tier_name', 'better_tier_name', 'best_tier_name',
            'minimum_service_charge', 'diagnostic_fee', 'trip_charge',
            'senior_discount_percentage', 'military_discount_percentage', 'first_time_discount_percentage'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(settings, field, data[field])
        
        settings.updated_at = datetime.utcnow()
        db.session.commit()
        
        # If labor rate changed, optionally update all pricing items
        if 'global_labor_rate' in data and data.get('update_all_items', False):
            new_labor_rate = data['global_labor_rate']
            if old_labor_rate != new_labor_rate:
                updated_count = update_all_pricing_for_labor_rate(
                    current_user.company_id, 
                    old_labor_rate, 
                    new_labor_rate,
                    current_user.id
                )
                
                return jsonify({
                    'message': f'Pricing settings updated successfully. {updated_count} pricing items updated.',
                    'settings': settings.to_dict(),
                    'items_updated': updated_count
                }), 200
        
        return jsonify({
            'message': 'Pricing settings updated successfully',
            'settings': settings.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update pricing settings: {str(e)}'}), 500

def update_all_pricing_for_labor_rate(company_id, old_rate, new_rate, user_id):
    """Update all pricing items when global labor rate changes"""
    items = FlatRatePricingItem.query.filter_by(
        company_id=company_id,
        is_active=True
    ).all()
    
    updated_count = 0
    
    for item in items:
        if item.labor_hours > 0:  # Only update items that have labor
            # Store old prices for history
            old_prices = {
                'good_price': item.good_price,
                'better_price': item.better_price,
                'best_price': item.best_price
            }
            
            # Update prices
            item.update_prices_for_labor_rate(new_rate)
            
            # Create history record
            history = PricingHistory(
                company_id=company_id,
                pricing_item_id=item.id,
                old_good_price=old_prices['good_price'],
                old_better_price=old_prices['better_price'],
                old_best_price=old_prices['best_price'],
                new_good_price=item.good_price,
                new_better_price=item.better_price,
                new_best_price=item.best_price,
                change_reason=f'Global labor rate change from ${old_rate} to ${new_rate}',
                changed_by_user_id=user_id,
                labor_rate_change=new_rate - old_rate
            )
            db.session.add(history)
            updated_count += 1
    
    db.session.commit()
    return updated_count

@pricing_bp.route('/pricing/categories', methods=['GET'])
@token_required
def get_pricing_categories(current_user):
    try:
        # Get all available categories
        categories = [
            {
                'value': category.value,
                'label': category.value.replace('_', ' ').title(),
                'description': get_category_description(category)
            }
            for category in ServiceCategory
        ]
        
        # Get category counts for this company
        category_counts = db.session.query(
            FlatRatePricingItem.category,
            db.func.count(FlatRatePricingItem.id).label('count')
        ).filter_by(
            company_id=current_user.company_id,
            is_active=True
        ).group_by(FlatRatePricingItem.category).all()
        
        # Add counts to categories
        count_dict = {row.category: row.count for row in category_counts}
        for category in categories:
            category['item_count'] = count_dict.get(ServiceCategory(category['value']), 0)
        
        return jsonify({
            'categories': categories,
            'total_items': sum(cat['item_count'] for cat in categories)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get categories: {str(e)}'}), 500

def get_category_description(category):
    """Get description for service category"""
    descriptions = {
        ServiceCategory.PLUMBING: 'General plumbing services and repairs',
        ServiceCategory.ELECTRICAL: 'Electrical installations and repairs',
        ServiceCategory.HVAC: 'Heating, ventilation, and air conditioning',
        ServiceCategory.GENERAL: 'General maintenance and repair services',
        ServiceCategory.APPLIANCE: 'Appliance repair and installation',
        ServiceCategory.DRAIN_CLEANING: 'Drain and sewer cleaning services',
        ServiceCategory.WATER_HEATER: 'Water heater installation and repair',
        ServiceCategory.FIXTURE_REPAIR: 'Plumbing fixture repairs and replacement',
        ServiceCategory.PIPE_REPAIR: 'Pipe repair and replacement services',
        ServiceCategory.EMERGENCY: 'Emergency and after-hours services'
    }
    return descriptions.get(category, 'Service category')

@pricing_bp.route('/pricing/templates', methods=['GET'])
@token_required
def get_pricing_templates(current_user):
    try:
        templates = PricingTemplate.query.filter_by(
            company_id=current_user.company_id,
            is_active=True
        ).order_by(PricingTemplate.name).all()
        
        return jsonify({
            'templates': [template.to_dict() for template in templates]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get pricing templates: {str(e)}'}), 500

@pricing_bp.route('/pricing/history/<int:item_id>', methods=['GET'])
@token_required
def get_pricing_history(current_user, item_id):
    try:
        # Verify item belongs to company
        item = FlatRatePricingItem.query.filter_by(
            id=item_id,
            company_id=current_user.company_id
        ).first()
        
        if not item:
            return jsonify({'message': 'Pricing item not found'}), 404
        
        history = PricingHistory.query.filter_by(
            pricing_item_id=item_id,
            company_id=current_user.company_id
        ).order_by(PricingHistory.changed_at.desc()).all()
        
        return jsonify({
            'history': [entry.to_dict() for entry in history]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get pricing history: {str(e)}'}), 500

@pricing_bp.route('/pricing/calculate', methods=['POST'])
@token_required
def calculate_pricing(current_user):
    try:
        data = request.get_json()
        
        # Get pricing items
        item_ids = data.get('item_ids', [])
        tier = data.get('tier', 'better')  # Default to 'better' tier
        
        if not item_ids:
            return jsonify({'message': 'No pricing items specified'}), 400
        
        items = FlatRatePricingItem.query.filter(
            FlatRatePricingItem.id.in_(item_ids),
            FlatRatePricingItem.company_id == current_user.company_id,
            FlatRatePricingItem.is_active == True
        ).all()
        
        if not items:
            return jsonify({'message': 'No valid pricing items found'}), 404
        
        # Calculate totals
        subtotal = 0
        line_items = []
        
        for item in items:
            if tier == 'good':
                price = item.good_price
            elif tier == 'best':
                price = item.best_price
            else:  # better (default)
                price = item.better_price
            
            subtotal += price
            
            line_items.append({
                'item_id': item.id,
                'item_code': item.item_code,
                'title': item.title,
                'description': item.description,
                'tier': tier,
                'price': price,
                'warranty_included': item.warranty_included,
                'warranty_period_months': item.warranty_period_months
            })
        
        # Apply discounts if specified
        discounts = data.get('discounts', {})
        discount_amount = 0
        
        if discounts.get('senior', False):
            settings = CompanyPricingSettings.query.filter_by(company_id=current_user.company_id).first()
            if settings:
                discount_amount += subtotal * (settings.senior_discount_percentage / 100)
        
        # Calculate final total
        total = subtotal - discount_amount
        
        return jsonify({
            'subtotal': subtotal,
            'discount_amount': discount_amount,
            'total': total,
            'tier': tier,
            'line_items': line_items,
            'discounts_applied': discounts
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to calculate pricing: {str(e)}'}), 500

