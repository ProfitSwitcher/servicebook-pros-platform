from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta

estimates_bp = Blueprint('estimates', __name__)

def _enrich(e):
    parts = e['customer_name'].split(' ', 1)
    return {
        **e,
        'estimateNumber': f"EST-{str(e['id']).zfill(3)}",
        'totalAmount': e['total'],
        'customer': {
            'id': e['customer_id'],
            'name': e['customer_name'],
            'first_name': parts[0],
            'last_name': parts[1] if len(parts) > 1 else '',
            'phone': '',
            'email': '',
            'address': '',
        },
        'lineItems': e.get('line_items', []),
        'notes': e.get('notes', ''),
        'createdDate': e.get('created_at', ''),
        'lastUpdated': e.get('created_at', ''),
        'expiryDate': e.get('expiry_date', ''),
    }

_estimates = [
    {'id': 1, 'title': 'Panel Upgrade Quote',      'customer_id': 1, 'customer_name': 'John Smith',    'status': 'pending',  'total': 1850.00, 'created_at': '2024-12-10', 'expiry_date': '2025-01-10'},
    {'id': 2, 'title': 'Outlet Install Quote',     'customer_id': 2, 'customer_name': 'Sarah Johnson', 'status': 'approved', 'total': 423.70,  'created_at': '2024-12-12', 'expiry_date': '2025-01-12'},
    {'id': 3, 'title': 'Lighting Retrofit Quote',  'customer_id': 3, 'customer_name': 'Mike Davis',    'status': 'sent',     'total': 675.00,  'created_at': '2024-12-14', 'expiry_date': '2025-01-14'},
]
_next_id = 4

@estimates_bp.route('/', methods=['GET'])
def get_estimates():
    status = request.args.get('status')
    result = [e for e in _estimates if not status or e['status'] == status]
    return jsonify([_enrich(e) for e in result])

@estimates_bp.route('/<int:estimate_id>', methods=['GET'])
def get_estimate(estimate_id):
    e = next((e for e in _estimates if e['id'] == estimate_id), None)
    if not e:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(_enrich(e))

@estimates_bp.route('/', methods=['POST'])
def create_estimate():
    global _next_id
    data = request.get_json() or {}
    estimate = {
        'id': _next_id,
        'title': data.get('title', ''),
        'customer_id': data.get('customer_id', 0),
        'customer_name': data.get('customer_name', ''),
        'status': data.get('status', 'pending'),
        'total': float(data.get('total', data.get('totalAmount', 0))),
        'created_at': datetime.utcnow().strftime('%Y-%m-%d'),
        'expiry_date': (datetime.utcnow() + timedelta(days=30)).strftime('%Y-%m-%d'),
        'notes': data.get('notes', ''),
        'line_items': data.get('lineItems', []),
    }
    _estimates.append(estimate)
    _next_id += 1
    return jsonify(_enrich(estimate)), 201

@estimates_bp.route('/<int:estimate_id>', methods=['PUT'])
def update_estimate(estimate_id):
    e = next((e for e in _estimates if e['id'] == estimate_id), None)
    if not e:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json() or {}
    e.update({k: v for k, v in data.items() if k not in ('id',)})
    return jsonify(_enrich(e))

@estimates_bp.route('/<int:estimate_id>', methods=['DELETE'])
def delete_estimate(estimate_id):
    global _estimates
    _estimates = [e for e in _estimates if e['id'] != estimate_id]
    return jsonify({'success': True})

@estimates_bp.route('/<int:estimate_id>/convert', methods=['POST'])
def convert_estimate(estimate_id):
    """Convert estimate to job (stub)."""
    e = next((e for e in _estimates if e['id'] == estimate_id), None)
    if not e:
        return jsonify({'error': 'Not found'}), 404
    e['status'] = 'converted'
    return jsonify({'success': True, 'job_id': estimate_id, 'estimate': _enrich(e)})
