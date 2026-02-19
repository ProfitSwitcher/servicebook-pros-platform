from flask import Blueprint, request, jsonify, make_response
from sqlalchemy import or_, and_
from src.models.user import db
from src.models.pricing import (
    ElectricalService, PricingSettings, ServiceCategory, 
    Estimate, EstimateItem
)
from decimal import Decimal
import uuid
from datetime import datetime

pricing_bp = Blueprint('pricing', __name__)

@pricing_bp.route('/', methods=['GET'])
def get_pricing_list():
    """Root endpoint — returns empty list (catalog uses in-memory sample data)."""
    return jsonify([])

@pricing_bp.route('/', methods=['POST'])
def create_pricing_item():
    data = request.get_json() or {}
    return jsonify({**data, 'id': 1}), 201

@pricing_bp.route('/<int:item_id>', methods=['PUT'])
def update_pricing_item(item_id):
    data = request.get_json() or {}
    return jsonify({**data, 'id': item_id})

@pricing_bp.route('/<int:item_id>', methods=['DELETE'])
def delete_pricing_item(item_id):
    return jsonify({'success': True})

# CORS headers for all pricing routes
@pricing_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@pricing_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all electrical service categories"""
    try:
        categories = ServiceCategory.query.filter_by(is_active=True).order_by(ServiceCategory.sort_order).all()
        
        # Add service count for each category
        result = []
        for category in categories:
            category_dict = category.to_dict()
            service_count = ElectricalService.query.filter_by(
                category_code=category.category_code, 
                is_active=True
            ).count()
            category_dict['service_count'] = service_count
            result.append(category_dict)
        
        return jsonify({
            'success': True,
            'categories': result,
            'total': len(result)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route('/categories/<category_code>/services', methods=['GET'])
def get_services_by_category(category_code):
    """Get all services for a specific category"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '', type=str)
        
        query = ElectricalService.query.filter_by(category_code=category_code, is_active=True)
        
        if search:
            query = query.filter(
                or_(
                    ElectricalService.service_name.contains(search),
                    ElectricalService.description.contains(search),
                    ElectricalService.service_code.contains(search)
                )
            )
        
        query = query.order_by(ElectricalService.service_code)
        
        # Paginate results
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        services = [service.to_dict() for service in pagination.items]
        
        return jsonify({
            'success': True,
            'services': services,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route('/services/search', methods=['GET'])
def search_services():
    """Search services across all categories"""
    try:
        search = request.args.get('q', '', type=str)
        category = request.args.get('category', '', type=str)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        if not search:
            return jsonify({'success': False, 'error': 'Search query required'}), 400
        
        query = ElectricalService.query.filter_by(is_active=True)
        
        # Add search filters
        search_filter = or_(
            ElectricalService.service_name.contains(search),
            ElectricalService.description.contains(search),
            ElectricalService.service_code.contains(search),
            ElectricalService.category_name.contains(search)
        )
        query = query.filter(search_filter)
        
        # Add category filter if specified
        if category:
            query = query.filter(ElectricalService.category_code == category)
        
        query = query.order_by(ElectricalService.service_code)
        
        # Paginate results
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        services = [service.to_dict() for service in pagination.items]
        
        return jsonify({
            'success': True,
            'services': services,
            'search_query': search,
            'category_filter': category,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route('/services/<service_code>', methods=['GET'])
def get_service_by_code(service_code):
    """Get a specific service by its code"""
    try:
        service = ElectricalService.query.filter_by(
            service_code=service_code, 
            is_active=True
        ).first()
        
        if not service:
            return jsonify({'success': False, 'error': 'Service not found'}), 404
        
        return jsonify({
            'success': True,
            'service': service.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route('/pricing-settings/<contractor_id>', methods=['GET'])
def get_pricing_settings(contractor_id):
    """Get pricing settings for a contractor"""
    try:
        settings = PricingSettings.query.filter_by(
            contractor_id=contractor_id, 
            is_active=True
        ).first()
        
        if not settings:
            # Create default settings for new contractor
            settings = PricingSettings(
                contractor_id=contractor_id,
                base_labor_rate=Decimal('75.00'),
                markup_percentage=Decimal('15.00'),
                cost_of_living_multiplier=Decimal('1.00')
            )
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'settings': settings.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route('/pricing-settings/<contractor_id>', methods=['PUT'])
def update_pricing_settings(contractor_id):
    """Update pricing settings for a contractor"""
    try:
        data = request.get_json()
        
        settings = PricingSettings.query.filter_by(
            contractor_id=contractor_id, 
            is_active=True
        ).first()
        
        if not settings:
            settings = PricingSettings(contractor_id=contractor_id)
            db.session.add(settings)
        
        # Update settings
        if 'base_labor_rate' in data:
            settings.base_labor_rate = Decimal(str(data['base_labor_rate']))
        if 'markup_percentage' in data:
            settings.markup_percentage = Decimal(str(data['markup_percentage']))
        if 'region' in data:
            settings.region = data['region']
        if 'cost_of_living_multiplier' in data:
            settings.cost_of_living_multiplier = Decimal(str(data['cost_of_living_multiplier']))
        if 'business_name' in data:
            settings.business_name = data['business_name']
        if 'license_number' in data:
            settings.license_number = data['license_number']
        
        settings.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'settings': settings.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route('/calculate-price', methods=['POST'])
def calculate_price():
    """Calculate adjusted price for a service based on contractor settings"""
    try:
        data = request.get_json()
        service_code = data.get('service_code')
        contractor_id = data.get('contractor_id', 'default')
        quantity = data.get('quantity', 1)
        
        if not service_code:
            return jsonify({'success': False, 'error': 'Service code required'}), 400
        
        # Get service
        service = ElectricalService.query.filter_by(
            service_code=service_code, 
            is_active=True
        ).first()
        
        if not service:
            return jsonify({'success': False, 'error': 'Service not found'}), 404
        
        # Get contractor settings
        settings = PricingSettings.query.filter_by(
            contractor_id=contractor_id, 
            is_active=True
        ).first()
        
        if not settings:
            settings = PricingSettings(
                contractor_id=contractor_id,
                base_labor_rate=Decimal('75.00'),
                markup_percentage=Decimal('15.00'),
                cost_of_living_multiplier=Decimal('1.00')
            )
        
        # Calculate adjusted price
        base_labor_cost = service.labor_hours * settings.base_labor_rate
        adjusted_labor_cost = base_labor_cost * settings.cost_of_living_multiplier
        material_cost = service.material_cost
        
        subtotal = adjusted_labor_cost + material_cost
        markup_amount = subtotal * (settings.markup_percentage / 100)
        unit_price = subtotal + markup_amount
        total_price = unit_price * quantity
        
        return jsonify({
            'success': True,
            'calculation': {
                'service_code': service_code,
                'service_name': service.service_name,
                'quantity': quantity,
                'labor_hours': float(service.labor_hours),
                'base_labor_rate': float(settings.base_labor_rate),
                'labor_cost': float(adjusted_labor_cost),
                'material_cost': float(material_cost),
                'markup_percentage': float(settings.markup_percentage),
                'markup_amount': float(markup_amount),
                'unit_price': float(unit_price),
                'total_price': float(total_price)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route('/estimates', methods=['POST'])
def create_estimate():
    """Create a new estimate"""
    try:
        data = request.get_json()
        
        # Generate estimate number
        estimate_number = f"EST-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        estimate = Estimate(
            estimate_number=estimate_number,
            contractor_id=data.get('contractor_id', 'default'),
            customer_name=data['customer_name'],
            customer_email=data.get('customer_email'),
            customer_phone=data.get('customer_phone'),
            customer_address=data.get('customer_address'),
            total_amount=Decimal('0.00'),
            labor_total=Decimal('0.00'),
            material_total=Decimal('0.00'),
            tax_amount=Decimal(str(data.get('tax_amount', 0))),
            notes=data.get('notes')
        )
        
        db.session.add(estimate)
        db.session.flush()  # Get the estimate ID
        
        # Add estimate items
        total_amount = Decimal('0.00')
        labor_total = Decimal('0.00')
        material_total = Decimal('0.00')
        
        for item_data in data.get('items', []):
            service = ElectricalService.query.filter_by(
                service_code=item_data['service_code']
            ).first()
            
            if not service:
                continue
            
            quantity = item_data.get('quantity', 1)
            unit_price = Decimal(str(item_data.get('unit_price', service.base_price)))
            item_total = unit_price * quantity
            
            estimate_item = EstimateItem(
                estimate_id=estimate.id,
                service_id=service.id,
                quantity=quantity,
                unit_price=unit_price,
                total_price=item_total,
                custom_description=item_data.get('custom_description'),
                discount_percentage=Decimal(str(item_data.get('discount_percentage', 0)))
            )
            
            db.session.add(estimate_item)
            
            total_amount += item_total
            labor_total += (service.labor_hours * service.base_price * quantity)
            material_total += (service.material_cost * quantity)
        
        # Update estimate totals
        estimate.total_amount = total_amount + estimate.tax_amount
        estimate.labor_total = labor_total
        estimate.material_total = material_total
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'estimate': estimate.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route('/estimates/<contractor_id>', methods=['GET'])
def get_estimates(contractor_id):
    """Get estimates for a contractor"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', '', type=str)
        
        query = Estimate.query.filter_by(contractor_id=contractor_id)
        
        if status:
            query = query.filter_by(status=status)
        
        query = query.order_by(Estimate.created_at.desc())
        
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        estimates = [estimate.to_dict() for estimate in pagination.items]
        
        return jsonify({
            'success': True,
            'estimates': estimates,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get platform statistics"""
    try:
        total_services = ElectricalService.query.filter_by(is_active=True).count()
        total_categories = ServiceCategory.query.filter_by(is_active=True).count()
        
        # Category breakdown
        category_stats = []
        categories = ServiceCategory.query.filter_by(is_active=True).order_by(ServiceCategory.sort_order).all()
        
        for category in categories:
            service_count = ElectricalService.query.filter_by(
                category_code=category.category_code, 
                is_active=True
            ).count()
            
            category_stats.append({
                'category_code': category.category_code,
                'category_name': category.category_name,
                'service_count': service_count
            })
        
        return jsonify({
            'success': True,
            'stats': {
                'total_services': total_services,
                'total_categories': total_categories,
                'category_breakdown': category_stats,
                'platform_name': 'ServiceBook Pros',
                'managed_by': 'ServiceBook Pros'
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500



@pricing_bp.route("/invoices/generate", methods=["POST"])
def generate_invoice():
    """Generate an HTML invoice from estimate data"""
    data = request.get_json()
    estimate_items = data.get("estimate", [])
    customer_info = data.get("customer", {})
    
    if not estimate_items:
        return jsonify({"success": False, "error": "Estimate is empty"}), 400

    try:
        # Calculate total
        total_amount = sum(item["base_price"] * item["quantity"] for item in estimate_items)
        current_date = datetime.now().strftime('%Y-%m-%d')
        invoice_number = uuid.uuid4().hex[:8].upper()

        # Generate HTML invoice
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>ServiceBook Pros Invoice</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .invoice-info {{ margin-bottom: 30px; }}
                .customer-info {{ margin-bottom: 30px; }}
                table {{ width: 100%; border-collapse: collapse; margin-bottom: 30px; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                .total {{ font-weight: bold; font-size: 18px; }}
                .footer {{ margin-top: 30px; text-align: center; color: #666; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ServiceBook Pros</h1>
                <h2>Invoice</h2>
            </div>
            
            <div class="invoice-info">
                <p><strong>Date:</strong> {current_date}</p>
                <p><strong>Invoice #:</strong> {invoice_number}</p>
            </div>
            
            <div class="customer-info">
                <h3>Bill To:</h3>
                <p>{customer_info.get("name", "N/A")}</p>
                <p>{customer_info.get("address", "")}</p>
                <p>{customer_info.get("email", "")}</p>
                <p>{customer_info.get("phone", "")}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Service Code</th>
                        <th>Service Name</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
        """
        
        for item in estimate_items:
            total_price = item["base_price"] * item["quantity"]
            html_content += f"""
                    <tr>
                        <td>{item["service_code"]}</td>
                        <td>{item["service_name"]}</td>
                        <td>{item["quantity"]}</td>
                        <td>${item["base_price"]:.2f}</td>
                        <td>${total_price:.2f}</td>
                    </tr>
            """
        
        html_content += f"""
                </tbody>
            </table>
            
            <div class="total">
                <p>Total: ${total_amount:.2f}</p>
            </div>
            
            <div class="footer">
                <p>Thank you for your business!</p>
                <p>Generated by ServiceBook Pros</p>
            </div>
        </body>
        </html>
        """

        response = make_response(html_content)
        response.headers['Content-Type'] = 'text/html'
        response.headers['Content-Disposition'] = f'attachment; filename=invoice-{invoice_number}.html'
        return response

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500




@pricing_bp.route("/categories/<category_code>/subcategories", methods=["GET"])
def get_subcategories(category_code):
    """Get all subcategories for a specific category"""
    try:
        from src.models.subcategory import ServiceSubcategory
        
        subcategories = ServiceSubcategory.query.filter_by(
            parent_category_code=category_code,
            is_active=True
        ).order_by(ServiceSubcategory.sort_order).all()
        
        return jsonify({
            'success': True,
            'subcategories': [subcategory.to_dict() for subcategory in subcategories],
            'total': len(subcategories)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@pricing_bp.route("/subcategories/<subcategory_code>/services", methods=["GET"])
def get_services_by_subcategory(subcategory_code):
    """Get all services for a specific subcategory"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        services_query = ElectricalService.query.filter_by(
            subcategory_code=subcategory_code,
            is_active=True
        ).order_by(ElectricalService.service_code)
        
        services = services_query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'services': [service.to_dict() for service in services.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': services.total,
                'pages': services.pages,
                'has_next': services.has_next,
                'has_prev': services.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

