from src.models.user import db
from datetime import datetime
import enum
import json

class InventoryCategory(enum.Enum):
    PLUMBING_PARTS = 'plumbing_parts'
    ELECTRICAL_PARTS = 'electrical_parts'
    HVAC_PARTS = 'hvac_parts'
    TOOLS = 'tools'
    CONSUMABLES = 'consumables'
    CHEMICALS = 'chemicals'
    FIXTURES = 'fixtures'
    APPLIANCES = 'appliances'
    SAFETY_EQUIPMENT = 'safety_equipment'
    OTHER = 'other'

class UnitOfMeasure(enum.Enum):
    EACH = 'each'
    FEET = 'feet'
    INCHES = 'inches'
    POUNDS = 'pounds'
    GALLONS = 'gallons'
    LITERS = 'liters'
    BOXES = 'boxes'
    ROLLS = 'rolls'
    PAIRS = 'pairs'
    SETS = 'sets'

class InventoryItem(db.Model):
    __tablename__ = 'inventory_items'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Item identification
    sku = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.Enum(InventoryCategory), nullable=False)
    subcategory = db.Column(db.String(100))
    
    # Supplier information
    supplier_name = db.Column(db.String(200))
    supplier_sku = db.Column(db.String(100))
    supplier_contact = db.Column(db.String(200))
    
    # Pricing
    cost_price = db.Column(db.Float, nullable=False)
    retail_price = db.Column(db.Float)
    markup_percentage = db.Column(db.Float, default=20.0)
    
    # Inventory tracking
    quantity_on_hand = db.Column(db.Float, default=0.0)
    quantity_reserved = db.Column(db.Float, default=0.0)  # Reserved for jobs
    quantity_available = db.Column(db.Float, default=0.0)  # On hand - reserved
    unit_of_measure = db.Column(db.Enum(UnitOfMeasure), default=UnitOfMeasure.EACH)
    
    # Reorder settings
    reorder_point = db.Column(db.Float, default=5.0)
    reorder_quantity = db.Column(db.Float, default=10.0)
    minimum_stock = db.Column(db.Float, default=1.0)
    maximum_stock = db.Column(db.Float, default=100.0)
    
    # Location and storage
    warehouse_location = db.Column(db.String(100))
    bin_location = db.Column(db.String(50))
    storage_requirements = db.Column(db.Text)
    
    # Item details
    manufacturer = db.Column(db.String(200))
    model_number = db.Column(db.String(100))
    serial_number = db.Column(db.String(100))
    weight = db.Column(db.Float)
    dimensions = db.Column(db.String(100))  # L x W x H
    
    # Status and flags
    is_active = db.Column(db.Boolean, default=True)
    is_serialized = db.Column(db.Boolean, default=False)
    is_hazardous = db.Column(db.Boolean, default=False)
    requires_certification = db.Column(db.Boolean, default=False)
    
    # Tracking
    last_counted_date = db.Column(db.DateTime)
    last_ordered_date = db.Column(db.DateTime)
    last_received_date = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    stock_movements = db.relationship('StockMovement', backref='inventory_item', lazy=True)
    job_materials = db.relationship('JobMaterial', backref='inventory_item', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'sku': self.sku,
            'name': self.name,
            'description': self.description,
            'category': self.category.value if self.category else None,
            'subcategory': self.subcategory,
            'supplier_name': self.supplier_name,
            'supplier_sku': self.supplier_sku,
            'supplier_contact': self.supplier_contact,
            'cost_price': self.cost_price,
            'retail_price': self.retail_price,
            'markup_percentage': self.markup_percentage,
            'quantity_on_hand': self.quantity_on_hand,
            'quantity_reserved': self.quantity_reserved,
            'quantity_available': self.quantity_available,
            'unit_of_measure': self.unit_of_measure.value if self.unit_of_measure else None,
            'reorder_point': self.reorder_point,
            'reorder_quantity': self.reorder_quantity,
            'minimum_stock': self.minimum_stock,
            'maximum_stock': self.maximum_stock,
            'warehouse_location': self.warehouse_location,
            'bin_location': self.bin_location,
            'storage_requirements': self.storage_requirements,
            'manufacturer': self.manufacturer,
            'model_number': self.model_number,
            'serial_number': self.serial_number,
            'weight': self.weight,
            'dimensions': self.dimensions,
            'is_active': self.is_active,
            'is_serialized': self.is_serialized,
            'is_hazardous': self.is_hazardous,
            'requires_certification': self.requires_certification,
            'last_counted_date': self.last_counted_date.isoformat() if self.last_counted_date else None,
            'last_ordered_date': self.last_ordered_date.isoformat() if self.last_ordered_date else None,
            'last_received_date': self.last_received_date.isoformat() if self.last_received_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'needs_reorder': self.quantity_available <= self.reorder_point
        }
    
    def calculate_available_quantity(self):
        """Calculate and update available quantity"""
        self.quantity_available = self.quantity_on_hand - self.quantity_reserved
        return self.quantity_available
    
    def reserve_quantity(self, quantity):
        """Reserve quantity for a job"""
        if self.quantity_available >= quantity:
            self.quantity_reserved += quantity
            self.calculate_available_quantity()
            return True
        return False
    
    def release_reservation(self, quantity):
        """Release reserved quantity"""
        self.quantity_reserved = max(0, self.quantity_reserved - quantity)
        self.calculate_available_quantity()

class StockMovementType(enum.Enum):
    PURCHASE = 'purchase'
    SALE = 'sale'
    ADJUSTMENT = 'adjustment'
    TRANSFER = 'transfer'
    RETURN = 'return'
    DAMAGED = 'damaged'
    LOST = 'lost'
    FOUND = 'found'
    CYCLE_COUNT = 'cycle_count'

class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    inventory_item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id'), nullable=False)
    
    # Movement details
    movement_type = db.Column(db.Enum(StockMovementType), nullable=False)
    quantity_change = db.Column(db.Float, nullable=False)  # Positive for increases, negative for decreases
    quantity_before = db.Column(db.Float, nullable=False)
    quantity_after = db.Column(db.Float, nullable=False)
    
    # Cost tracking
    unit_cost = db.Column(db.Float)
    total_cost = db.Column(db.Float)
    
    # Reference information
    reference_type = db.Column(db.String(50))  # job, purchase_order, adjustment, etc.
    reference_id = db.Column(db.Integer)
    reference_number = db.Column(db.String(100))
    
    # Details
    reason = db.Column(db.String(200))
    notes = db.Column(db.Text)
    performed_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Location
    from_location = db.Column(db.String(100))
    to_location = db.Column(db.String(100))
    
    # Timestamp
    movement_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'inventory_item_id': self.inventory_item_id,
            'movement_type': self.movement_type.value if self.movement_type else None,
            'quantity_change': self.quantity_change,
            'quantity_before': self.quantity_before,
            'quantity_after': self.quantity_after,
            'unit_cost': self.unit_cost,
            'total_cost': self.total_cost,
            'reference_type': self.reference_type,
            'reference_id': self.reference_id,
            'reference_number': self.reference_number,
            'reason': self.reason,
            'notes': self.notes,
            'performed_by_user_id': self.performed_by_user_id,
            'from_location': self.from_location,
            'to_location': self.to_location,
            'movement_date': self.movement_date.isoformat() if self.movement_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class JobMaterial(db.Model):
    __tablename__ = 'job_materials'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    inventory_item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id'), nullable=False)
    
    # Quantities
    quantity_requested = db.Column(db.Float, nullable=False)
    quantity_allocated = db.Column(db.Float, default=0.0)
    quantity_used = db.Column(db.Float, default=0.0)
    quantity_returned = db.Column(db.Float, default=0.0)
    
    # Pricing
    unit_cost = db.Column(db.Float)
    unit_price = db.Column(db.Float)  # Price charged to customer
    total_cost = db.Column(db.Float)
    total_price = db.Column(db.Float)
    
    # Status
    is_allocated = db.Column(db.Boolean, default=False)
    is_picked = db.Column(db.Boolean, default=False)
    is_installed = db.Column(db.Boolean, default=False)
    
    # Notes
    notes = db.Column(db.Text)
    
    # Timestamps
    requested_at = db.Column(db.DateTime, default=datetime.utcnow)
    allocated_at = db.Column(db.DateTime)
    picked_at = db.Column(db.DateTime)
    installed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'inventory_item_id': self.inventory_item_id,
            'quantity_requested': self.quantity_requested,
            'quantity_allocated': self.quantity_allocated,
            'quantity_used': self.quantity_used,
            'quantity_returned': self.quantity_returned,
            'unit_cost': self.unit_cost,
            'unit_price': self.unit_price,
            'total_cost': self.total_cost,
            'total_price': self.total_price,
            'is_allocated': self.is_allocated,
            'is_picked': self.is_picked,
            'is_installed': self.is_installed,
            'notes': self.notes,
            'requested_at': self.requested_at.isoformat() if self.requested_at else None,
            'allocated_at': self.allocated_at.isoformat() if self.allocated_at else None,
            'picked_at': self.picked_at.isoformat() if self.picked_at else None,
            'installed_at': self.installed_at.isoformat() if self.installed_at else None
        }

class PurchaseOrder(db.Model):
    __tablename__ = 'purchase_orders'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # PO details
    po_number = db.Column(db.String(50), unique=True, nullable=False)
    supplier_name = db.Column(db.String(200), nullable=False)
    supplier_contact = db.Column(db.Text)
    
    # Status
    status = db.Column(db.String(50), default='draft')  # draft, sent, received, cancelled
    
    # Financial
    subtotal = db.Column(db.Float, default=0.0)
    tax_amount = db.Column(db.Float, default=0.0)
    shipping_cost = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, default=0.0)
    
    # Dates
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    expected_delivery_date = db.Column(db.DateTime)
    received_date = db.Column(db.DateTime)
    
    # Notes
    notes = db.Column(db.Text)
    
    # Tracking
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    line_items = db.relationship('PurchaseOrderLineItem', backref='purchase_order', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'po_number': self.po_number,
            'supplier_name': self.supplier_name,
            'supplier_contact': self.supplier_contact,
            'status': self.status,
            'subtotal': self.subtotal,
            'tax_amount': self.tax_amount,
            'shipping_cost': self.shipping_cost,
            'total_amount': self.total_amount,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'expected_delivery_date': self.expected_delivery_date.isoformat() if self.expected_delivery_date else None,
            'received_date': self.received_date.isoformat() if self.received_date else None,
            'notes': self.notes,
            'created_by_user_id': self.created_by_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'line_items': [item.to_dict() for item in self.line_items]
        }

class PurchaseOrderLineItem(db.Model):
    __tablename__ = 'purchase_order_line_items'
    
    id = db.Column(db.Integer, primary_key=True)
    purchase_order_id = db.Column(db.Integer, db.ForeignKey('purchase_orders.id'), nullable=False)
    inventory_item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id'))
    
    # Item details (for items not in inventory yet)
    item_description = db.Column(db.String(200), nullable=False)
    supplier_sku = db.Column(db.String(100))
    
    # Quantities
    quantity_ordered = db.Column(db.Float, nullable=False)
    quantity_received = db.Column(db.Float, default=0.0)
    unit_cost = db.Column(db.Float, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)
    
    # Status
    is_received = db.Column(db.Boolean, default=False)
    received_date = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'purchase_order_id': self.purchase_order_id,
            'inventory_item_id': self.inventory_item_id,
            'item_description': self.item_description,
            'supplier_sku': self.supplier_sku,
            'quantity_ordered': self.quantity_ordered,
            'quantity_received': self.quantity_received,
            'unit_cost': self.unit_cost,
            'total_cost': self.total_cost,
            'is_received': self.is_received,
            'received_date': self.received_date.isoformat() if self.received_date else None
        }

