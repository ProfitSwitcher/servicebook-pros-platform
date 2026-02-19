from flask import Blueprint, jsonify, request

technicians_bp = Blueprint('technicians', __name__)

_technicians = [
    {'id': 1, 'first_name': 'Alex', 'last_name': 'Rivera', 'email': 'alex@example.com', 'phone': '555-0201', 'role': 'Lead Technician', 'hourly_rate': 45.0, 'status': 'active'},
    {'id': 2, 'first_name': 'Jordan', 'last_name': 'Lee', 'email': 'jordan@example.com', 'phone': '555-0202', 'role': 'Technician', 'hourly_rate': 35.0, 'status': 'active'},
]
_next_id = 3

@technicians_bp.route('/', methods=['GET'])
def get_technicians():
    return jsonify(_technicians)

@technicians_bp.route('/<int:tech_id>', methods=['GET'])
def get_technician(tech_id):
    t = next((t for t in _technicians if t['id'] == tech_id), None)
    if not t:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(t)

@technicians_bp.route('/', methods=['POST'])
def create_technician():
    global _next_id
    data = request.get_json() or {}
    tech = {
        'id': _next_id,
        'first_name': data.get('first_name', ''),
        'last_name': data.get('last_name', ''),
        'email': data.get('email', ''),
        'phone': data.get('phone', ''),
        'role': data.get('role', 'Technician'),
        'hourly_rate': data.get('hourly_rate', 35.0),
        'status': 'active',
    }
    _technicians.append(tech)
    _next_id += 1
    return jsonify(tech), 201

@technicians_bp.route('/<int:tech_id>', methods=['PUT'])
def update_technician(tech_id):
    t = next((t for t in _technicians if t['id'] == tech_id), None)
    if not t:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json() or {}
    t.update({k: v for k, v in data.items() if k != 'id'})
    return jsonify(t)
