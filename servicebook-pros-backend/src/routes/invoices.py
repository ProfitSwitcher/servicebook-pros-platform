from flask import Blueprint, jsonify, request
from datetime import datetime

invoices_bp = Blueprint('invoices', __name__)

_invoices = [
    {'id': 1, 'invoice_number': 'INV-001', 'customer_id': 1, 'customer_name': 'John Smith', 'status': 'paid', 'amount': 1850.00, 'due_date': '2024-12-30', 'created_at': '2024-12-15'},
    {'id': 2, 'invoice_number': 'INV-002', 'customer_id': 2, 'customer_name': 'Sarah Johnson', 'status': 'pending', 'amount': 423.70, 'due_date': '2025-01-05', 'created_at': '2024-12-18'},
    {'id': 3, 'invoice_number': 'INV-003', 'customer_id': 3, 'customer_name': 'Mike Davis', 'status': 'overdue', 'amount': 675.00, 'due_date': '2024-12-10', 'created_at': '2024-12-01'},
]
_next_id = 4

@invoices_bp.route('/', methods=['GET'])
def get_invoices():
    return jsonify(_invoices)

@invoices_bp.route('/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    inv = next((i for i in _invoices if i['id'] == invoice_id), None)
    if not inv:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(inv)

@invoices_bp.route('/', methods=['POST'])
def create_invoice():
    global _next_id
    data = request.get_json() or {}
    invoice = {
        'id': _next_id,
        'invoice_number': f'INV-{str(_next_id).zfill(3)}',
        'customer_id': data.get('customer_id'),
        'customer_name': data.get('customer_name', ''),
        'status': data.get('status', 'pending'),
        'amount': data.get('amount', 0.0),
        'due_date': data.get('due_date', ''),
        'created_at': datetime.utcnow().strftime('%Y-%m-%d'),
    }
    _invoices.append(invoice)
    _next_id += 1
    return jsonify(invoice), 201

@invoices_bp.route('/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    inv = next((i for i in _invoices if i['id'] == invoice_id), None)
    if not inv:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json() or {}
    inv.update({k: v for k, v in data.items() if k != 'id'})
    return jsonify(inv)
