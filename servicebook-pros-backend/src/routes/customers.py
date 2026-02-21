from flask import Blueprint, jsonify, request
from datetime import datetime

customers_bp = Blueprint('customers', __name__)

# In-memory store (replace with DB models as needed)
_customers = [
    {'id': 1,  'name': 'John Smith',      'email': 'john.smith@email.com',    'phone': '555-0101', 'address': '123 Main St, Vestal, NY 13850',       'created_at': '2024-01-15'},
    {'id': 2,  'name': 'Sarah Johnson',   'email': 'sarah.j@gmail.com',       'phone': '555-0102', 'address': '456 Oak Ave, Binghamton, NY 13901',    'created_at': '2024-02-20'},
    {'id': 3,  'name': 'Mike Davis',      'email': 'mike.davis@hotmail.com',  'phone': '555-0103', 'address': '789 Pine Rd, Endicott, NY 13760',      'created_at': '2024-03-10'},
    {'id': 4,  'name': 'Lisa Chen',       'email': 'lchen@company.com',       'phone': '555-0104', 'address': '321 Elm St, Johnson City, NY 13790',   'created_at': '2024-04-05'},
    {'id': 5,  'name': 'Robert Williams', 'email': 'rwilliams@email.com',     'phone': '555-0105', 'address': '654 Maple Dr, Owego, NY 13827',        'created_at': '2024-05-12'},
    {'id': 6,  'name': 'Jennifer Brown',  'email': 'jbrown@gmail.com',        'phone': '555-0106', 'address': '987 Cedar Ln, Whitney Point, NY 13862','created_at': '2024-06-18'},
    {'id': 7,  'name': 'David Martinez',  'email': 'dmartinez@work.com',      'phone': '555-0107', 'address': '147 Birch Blvd, Apalachin, NY 13732',  'created_at': '2024-07-22'},
    {'id': 8,  'name': 'Amanda Taylor',   'email': 'ataylor@personal.com',    'phone': '555-0108', 'address': '258 Walnut Way, Candor, NY 13743',     'created_at': '2024-08-30'},
    {'id': 9,  'name': 'Thomas Anderson', 'email': 'tanderson@email.com',     'phone': '555-0109', 'address': '369 Spruce St, Newark Valley, NY 13811','created_at': '2024-09-14'},
    {'id': 10, 'name': 'Patricia Wilson', 'email': 'pwilson@gmail.com',       'phone': '555-0110', 'address': '741 Ash Ave, Nichols, NY 13812',       'created_at': '2024-10-01'},
]
_next_id = 11

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
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    name = data.get('name') or f"{first_name} {last_name}".strip()
    customer = {
        'id': _next_id,
        'name': name,
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
