from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta

estimates_bp = Blueprint('estimates', __name__)

def _enrich(e):
    parts = e['customer_name'].split(' ', 1)
    return {
        **e,
        'estimateNumber': f"EST-{str(e['id']).zfill(3)}",
        'totalAmount': e['total'],
        'total_amount': e['total'],
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
    {'id': 1, 'estimate_number': 'EST-001', 'customer_id': 1, 'customer_name': 'John Smith',      'title': 'Home Rewire Project',         'status': 'approved', 'total': 4800.00, 'amount': 4800.00, 'created_at': '2024-10-01', 'expiry_date': '2024-11-01', 'notes': 'Full home rewire, 2400 sq ft', 'line_items': []},
    {'id': 2, 'estimate_number': 'EST-002', 'customer_id': 2, 'customer_name': 'Sarah Johnson',   'title': 'Kitchen Remodel Electrical',  'status': 'sent',     'total': 1850.00, 'amount': 1850.00, 'created_at': '2024-12-01', 'expiry_date': '2025-01-01', 'notes': 'New circuits for appliances, under-cabinet lighting', 'line_items': []},
    {'id': 3, 'estimate_number': 'EST-003', 'customer_id': 5, 'customer_name': 'Robert Williams', 'title': 'Garage Electrical Package',   'status': 'pending',  'total': 2200.00, 'amount': 2200.00, 'created_at': '2025-01-05', 'expiry_date': '2025-02-05', 'notes': '240V circuit, outlets, lighting', 'line_items': []},
    {'id': 4, 'estimate_number': 'EST-004', 'customer_id': 8, 'customer_name': 'Amanda Taylor',   'title': 'Service Panel Replacement',   'status': 'pending',  'total': 3200.00, 'amount': 3200.00, 'created_at': '2025-01-12', 'expiry_date': '2025-02-12', 'notes': '200A panel, new breakers, grounding', 'line_items': []},
    {'id': 5, 'estimate_number': 'EST-005', 'customer_id': 9, 'customer_name': 'Thomas Anderson', 'title': 'Smart Home Wiring',           'status': 'draft',    'total': 5600.00, 'amount': 5600.00, 'created_at': '2025-01-20', 'expiry_date': '2025-02-20', 'notes': 'Structured wiring, smart switches throughout', 'line_items': []},
    {'id': 6, 'estimate_number': 'EST-006', 'customer_id': 3, 'customer_name': 'Mike Davis',      'title': 'Office Expansion Electrical', 'status': 'approved', 'total': 3400.00, 'amount': 3400.00, 'created_at': '2024-11-15', 'expiry_date': '2024-12-15', 'notes': 'New circuits, server room power', 'line_items': []},
    {'id': 7, 'estimate_number': 'EST-007', 'customer_id': 10,'customer_name': 'Patricia Wilson', 'title': 'Landscape Lighting Design',   'status': 'sent',     'total': 1450.00, 'amount': 1450.00, 'created_at': '2025-01-25', 'expiry_date': '2025-02-25', 'notes': 'Low voltage lighting, 15 fixtures', 'line_items': []},
    {'id': 8, 'estimate_number': 'EST-008', 'customer_id': 4, 'customer_name': 'Lisa Chen',       'title': 'Solar Prep Package',          'status': 'pending',  'total': 2800.00, 'amount': 2800.00, 'created_at': '2025-02-01', 'expiry_date': '2025-03-01', 'notes': 'Panel prep, conduit, meter upgrade for solar', 'line_items': []},
]
_next_id = 9

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
