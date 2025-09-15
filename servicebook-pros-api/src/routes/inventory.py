from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.inventory import (
    InventoryItem, StockMovement, JobMaterial, PurchaseOrder, PurchaseOrderLineItem,
    InventoryCategory, UnitOfMeasure, StockMovementType
)
from src.routes.auth import token_required
from datetime import datetime
from sqlalchemy import func, and_, or_

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/inventory/items', methods=['GET'])
@token_required
def get_inventory_items(current_user):
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        category = request.args.get('category', '')
        search = request.args.get('search', '')
        low_stock_only = request.args.get('low_stock_only', 'false').lower() == 'true'
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        
        # Build query
        query = InventoryItem.query.filter_by(company_id=current_user.company_id)
        
        # Apply filters
        if active_only:
            query = query.filter_by(is_active=True)
            
        if category:
            query = query.filter_by(category=InventoryCategory(category))
            
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    InventoryItem.name.ilike(search_term),
                    InventoryItem.sku.ilike(search_term),
                    InventoryItem.description.ilike(search_term),
                    InventoryItem.manufacturer.ilike(search_term),
                    InventoryItem.model_number.ilike(search_term)
                )
            )
        
        if low_stock_only:
            query = query.filter(InventoryItem.quantity_available <= InventoryItem.reorder_point)
        
        # Order by name
        query = query.order_by(InventoryItem.name)
        
        # Paginate
        items = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'inventory_items': [item.to_dict() for item in items.items],
            'total': items.total,
            'pages': items.pages,
            'current_page': items.page,
            'per_page': items.per_page,
            'has_next': items.has_next,
            'has_prev': items.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get inventory items: {str(e)}'}), 500

@inventory_bp.route('/inventory/items/<int:item_id>', methods=['GET'])
@token_required
def get_inventory_item(current_user, item_id):
    try:
        item = InventoryItem.query.filter_by(
            id=item_id, 
            company_id=current_user.company_id
        ).first()
        
        if not item:
            return jsonify({'message': 'Inventory item not found'}), 404
        
        # Get recent stock movements
        recent_movements = StockMovement.query.filter_by(
            inventory_item_id=item_id,
            company_id=current_user.company_id
        ).order_by(StockMovement.movement_date.desc()).limit(10).all()
        
        item_data = item.to_dict()
        item_data['recent_movements'] = [movement.to_dict() for movement in recent_movements]
        
        return jsonify(item_data), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get inventory item: {str(e)}'}), 500

@inventory_bp.route('/inventory/items', methods=['POST'])
@token_required
def create_inventory_item(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['sku', 'name', 'category', 'cost_price']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if SKU already exists for this company
        existing_item = InventoryItem.query.filter_by(
            company_id=current_user.company_id,
            sku=data['sku']
        ).first()
        
        if existing_item:
            return jsonify({'message': 'SKU already exists'}), 400
        
        # Create inventory item
        item = InventoryItem(
            company_id=current_user.company_id,
            sku=data['sku'],
            name=data['name'],
            description=data.get('description'),
            category=InventoryCategory(data['category']),
            subcategory=data.get('subcategory'),
            supplier_name=data.get('supplier_name'),
            supplier_sku=data.get('supplier_sku'),
            supplier_contact=data.get('supplier_contact'),
            cost_price=data['cost_price'],
            retail_price=data.get('retail_price'),
            markup_percentage=data.get('markup_percentage', 20.0),
            quantity_on_hand=data.get('quantity_on_hand', 0.0),
            unit_of_measure=UnitOfMeasure(data.get('unit_of_measure', 'each')),
            reorder_point=data.get('reorder_point', 5.0),
            reorder_quantity=data.get('reorder_quantity', 10.0),
            minimum_stock=data.get('minimum_stock', 1.0),
            maximum_stock=data.get('maximum_stock', 100.0),
            warehouse_location=data.get('warehouse_location'),
            bin_location=data.get('bin_location'),
            storage_requirements=data.get('storage_requirements'),
            manufacturer=data.get('manufacturer'),
            model_number=data.get('model_number'),
            serial_number=data.get('serial_number'),
            weight=data.get('weight'),
            dimensions=data.get('dimensions'),
            is_active=data.get('is_active', True),
            is_serialized=data.get('is_serialized', False),
            is_hazardous=data.get('is_hazardous', False),
            requires_certification=data.get('requires_certification', False)
        )
        
        # Calculate available quantity
        item.calculate_available_quantity()
        
        db.session.add(item)
        db.session.flush()
        
        # Create initial stock movement if quantity > 0
        if item.quantity_on_hand > 0:
            movement = StockMovement(
                company_id=current_user.company_id,
                inventory_item_id=item.id,
                movement_type=StockMovementType.ADJUSTMENT,
                quantity_change=item.quantity_on_hand,
                quantity_before=0.0,
                quantity_after=item.quantity_on_hand,
                unit_cost=item.cost_price,
                total_cost=item.cost_price * item.quantity_on_hand,
                reason='Initial stock entry',
                performed_by_user_id=current_user.id
            )
            db.session.add(movement)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Inventory item created successfully',
            'inventory_item': item.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create inventory item: {str(e)}'}), 500

@inventory_bp.route('/inventory/items/<int:item_id>', methods=['PUT'])
@token_required
def update_inventory_item(current_user, item_id):
    try:
        item = InventoryItem.query.filter_by(
            id=item_id, 
            company_id=current_user.company_id
        ).first()
        
        if not item:
            return jsonify({'message': 'Inventory item not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        updatable_fields = [
            'name', 'description', 'subcategory', 'supplier_name', 'supplier_sku', 'supplier_contact',
            'cost_price', 'retail_price', 'markup_percentage', 'reorder_point', 'reorder_quantity',
            'minimum_stock', 'maximum_stock', 'warehouse_location', 'bin_location', 'storage_requirements',
            'manufacturer', 'model_number', 'serial_number', 'weight', 'dimensions',
            'is_active', 'is_serialized', 'is_hazardous', 'requires_certification'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == 'category':
                    setattr(item, field, InventoryCategory(data[field]))
                elif field == 'unit_of_measure':
                    setattr(item, field, UnitOfMeasure(data[field]))
                else:
                    setattr(item, field, data[field])
        
        item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Inventory item updated successfully',
            'inventory_item': item.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update inventory item: {str(e)}'}), 500

@inventory_bp.route('/inventory/items/<int:item_id>/adjust', methods=['POST'])
@token_required
def adjust_inventory(current_user, item_id):
    try:
        item = InventoryItem.query.filter_by(
            id=item_id, 
            company_id=current_user.company_id
        ).first()
        
        if not item:
            return jsonify({'message': 'Inventory item not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if 'quantity_change' not in data:
            return jsonify({'message': 'quantity_change is required'}), 400
        
        quantity_change = float(data['quantity_change'])
        reason = data.get('reason', 'Manual adjustment')
        notes = data.get('notes', '')
        
        # Store old quantity
        old_quantity = item.quantity_on_hand
        
        # Update quantity
        item.quantity_on_hand += quantity_change
        
        # Ensure quantity doesn't go negative
        if item.quantity_on_hand < 0:
            return jsonify({'message': 'Adjustment would result in negative inventory'}), 400
        
        # Recalculate available quantity
        item.calculate_available_quantity()
        
        # Create stock movement record
        movement = StockMovement(
            company_id=current_user.company_id,
            inventory_item_id=item.id,
            movement_type=StockMovementType.ADJUSTMENT,
            quantity_change=quantity_change,
            quantity_before=old_quantity,
            quantity_after=item.quantity_on_hand,
            unit_cost=item.cost_price,
            total_cost=item.cost_price * abs(quantity_change),
            reason=reason,
            notes=notes,
            performed_by_user_id=current_user.id
        )
        
        db.session.add(movement)
        item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Inventory adjusted successfully',
            'inventory_item': item.to_dict(),
            'movement': movement.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to adjust inventory: {str(e)}'}), 500

@inventory_bp.route('/inventory/low-stock', methods=['GET'])
@token_required
def get_low_stock_items(current_user):
    try:
        items = InventoryItem.query.filter(
            and_(
                InventoryItem.company_id == current_user.company_id,
                InventoryItem.is_active == True,
                InventoryItem.quantity_available <= InventoryItem.reorder_point
            )
        ).order_by(InventoryItem.quantity_available.asc()).all()
        
        return jsonify({
            'low_stock_items': [item.to_dict() for item in items],
            'count': len(items)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get low stock items: {str(e)}'}), 500

@inventory_bp.route('/inventory/movements', methods=['GET'])
@token_required
def get_stock_movements(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        item_id = request.args.get('item_id', type=int)
        movement_type = request.args.get('movement_type', '')
        
        query = StockMovement.query.filter_by(company_id=current_user.company_id)
        
        if item_id:
            query = query.filter_by(inventory_item_id=item_id)
            
        if movement_type:
            query = query.filter_by(movement_type=StockMovementType(movement_type))
        
        query = query.order_by(StockMovement.movement_date.desc())
        
        movements = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'movements': [movement.to_dict() for movement in movements.items],
            'total': movements.total,
            'pages': movements.pages,
            'current_page': movements.page,
            'per_page': movements.per_page,
            'has_next': movements.has_next,
            'has_prev': movements.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get stock movements: {str(e)}'}), 500

@inventory_bp.route('/inventory/categories', methods=['GET'])
@token_required
def get_inventory_categories(current_user):
    try:
        # Get all available categories
        categories = [
            {
                'value': category.value,
                'label': category.value.replace('_', ' ').title(),
                'description': get_category_description(category)
            }
            for category in InventoryCategory
        ]
        
        # Get category counts for this company
        category_counts = db.session.query(
            InventoryItem.category,
            func.count(InventoryItem.id).label('count'),
            func.sum(InventoryItem.quantity_on_hand * InventoryItem.cost_price).label('total_value')
        ).filter_by(
            company_id=current_user.company_id,
            is_active=True
        ).group_by(InventoryItem.category).all()
        
        # Add counts to categories
        count_dict = {row.category: {'count': row.count, 'value': row.total_value or 0} for row in category_counts}
        for category in categories:
            category_data = count_dict.get(InventoryCategory(category['value']), {'count': 0, 'value': 0})
            category['item_count'] = category_data['count']
            category['total_value'] = category_data['value']
        
        return jsonify({
            'categories': categories,
            'total_items': sum(cat['item_count'] for cat in categories),
            'total_value': sum(cat['total_value'] for cat in categories)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get categories: {str(e)}'}), 500

def get_category_description(category):
    """Get description for inventory category"""
    descriptions = {
        InventoryCategory.PLUMBING_PARTS: 'Pipes, fittings, valves, and plumbing components',
        InventoryCategory.ELECTRICAL_PARTS: 'Wires, outlets, switches, and electrical components',
        InventoryCategory.HVAC_PARTS: 'Heating, ventilation, and air conditioning parts',
        InventoryCategory.TOOLS: 'Hand tools, power tools, and equipment',
        InventoryCategory.CONSUMABLES: 'Disposable items and supplies',
        InventoryCategory.CHEMICALS: 'Cleaning agents, solvents, and chemicals',
        InventoryCategory.FIXTURES: 'Sinks, toilets, faucets, and fixtures',
        InventoryCategory.APPLIANCES: 'Water heaters, furnaces, and appliances',
        InventoryCategory.SAFETY_EQUIPMENT: 'Safety gear and protective equipment',
        InventoryCategory.OTHER: 'Miscellaneous inventory items'
    }
    return descriptions.get(category, 'Inventory category')

@inventory_bp.route('/inventory/dashboard', methods=['GET'])
@token_required
def get_inventory_dashboard(current_user):
    try:
        # Get summary statistics
        total_items = InventoryItem.query.filter_by(
            company_id=current_user.company_id,
            is_active=True
        ).count()
        
        total_value = db.session.query(
            func.sum(InventoryItem.quantity_on_hand * InventoryItem.cost_price)
        ).filter_by(
            company_id=current_user.company_id,
            is_active=True
        ).scalar() or 0
        
        low_stock_count = InventoryItem.query.filter(
            and_(
                InventoryItem.company_id == current_user.company_id,
                InventoryItem.is_active == True,
                InventoryItem.quantity_available <= InventoryItem.reorder_point
            )
        ).count()
        
        out_of_stock_count = InventoryItem.query.filter(
            and_(
                InventoryItem.company_id == current_user.company_id,
                InventoryItem.is_active == True,
                InventoryItem.quantity_available <= 0
            )
        ).count()
        
        # Get recent movements
        recent_movements = StockMovement.query.filter_by(
            company_id=current_user.company_id
        ).order_by(StockMovement.movement_date.desc()).limit(10).all()
        
        return jsonify({
            'summary': {
                'total_items': total_items,
                'total_value': total_value,
                'low_stock_count': low_stock_count,
                'out_of_stock_count': out_of_stock_count
            },
            'recent_movements': [movement.to_dict() for movement in recent_movements]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get inventory dashboard: {str(e)}'}), 500

