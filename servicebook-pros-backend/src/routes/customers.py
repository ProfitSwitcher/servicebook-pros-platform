from flask import Blueprint, jsonify, request
from datetime import datetime

customers_bp = Blueprint('customers', __name__)

# In-memory store (replace with DB models as needed)
_customers = [
    {'id': 1, 'name': 'John Smith', 'email': 'john@example.com', 'phone': '555-0101', 'address': '123 Main St', 'created_at': '2024-01-15'},
    {'id': 2, 'name': 'Sarah Johnson', 'email': 'sarah@example.com', 'phone': '555-0102', 'address': '456 Oak Ave', 'created_at': '2024-02-20'},
    {'id': 3, 'name': 'Mike Davis', 'email': 'mike@example.com', 'phone': '555-0103', 'address': '789 Pine Rd', 'created_at': '2024-03-10'},
]
_next_id = 4

@customers_bp.route('/', methods=['GET'])
def get_customers():
    return jsonify(_customers)

@customers_bp.route('/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    c = next((c for c in _customers if c['id'] == customer_id), None)
    if not c:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(c)

@customers_bp.route('/', methods=['POST'])
def create_customer():
    global _next_id
    data = request.get_json() or {}
    customer = {
        'id': _next_id,
        'name': data.get('name', ''),
        'email': data.get('email', ''),
        'phone': data.get('phone', ''),
        'address': data.get('address', ''),
        'created_at': datetime.utcnow().strftime('%Y-%m-%d')
    }
    _customers.append(customer)
    _next_id += 1
    return jsonify(customer), 201

@customers_bp.route('/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    c = next((c for c in _customers if c['id'] == customer_id), None)
    if not c:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json() or {}
    c.update({k: v for k, v in data.items() if k != 'id'})
    return jsonify(c)

@customers_bp.route('/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    global _customers
    _customers = [c for c in _customers if c['id'] != customer_id]
    return '', 204
