from flask import Blueprint, jsonify, request
from datetime import datetime

invoices_bp = Blueprint('invoices', __name__)

def _enrich(inv):
    """Add frontend-expected aliases to an invoice dict."""
    parts = inv['customer_name'].split(' ', 1)
    return {
        **inv,
        # InvoiceManagement expects total_amount
        'total_amount': inv['amount'],
        # InvoiceManagement expects date_issued
        'date_issued': inv['created_at'],
        # InvoiceManagement expects customer as object
        'customer': {
            'id': inv['customer_id'],
            'first_name': parts[0],
            'last_name': parts[1] if len(parts) > 1 else '',
            'name': inv['customer_name'],
        },
    }

_invoices = [
    {'id': 1, 'invoice_number': 'INV-001', 'customer_id': 1, 'customer_name': 'John Smith',  'status': 'paid',    'amount': 1850.00, 'due_date': '2024-12-30', 'created_at': '2024-12-15'},
    {'id': 2, 'invoice_number': 'INV-002', 'customer_id': 2, 'customer_name': 'Sarah Johnson','status': 'pending', 'amount': 423.70,  'due_date': '2025-01-05', 'created_at': '2024-12-18'},
    {'id': 3, 'invoice_number': 'INV-003', 'customer_id': 3, 'customer_name': 'Mike Davis',   'status': 'overdue', 'amount': 675.00,  'due_date': '2024-12-10', 'created_at': '2024-12-01'},
]
_next_id = 4

@invoices_bp.route('/', methods=['GET'])
def get_invoices():
    return jsonify([_enrich(i) for i in _invoices])

@invoices_bp.route('/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    inv = next((i for i in _invoices if i['id'] == invoice_id), None)
    if not inv:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(_enrich(inv))

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
        'amount': float(data.get('amount', data.get('total_amount', 0))),
        'due_date': data.get('due_date', ''),
        'created_at': datetime.utcnow().strftime('%Y-%m-%d'),
    }
    _invoices.append(invoice)
    _next_id += 1
    return jsonify(_enrich(invoice)), 201

@invoices_bp.route('/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    inv = next((i for i in _invoices if i['id'] == invoice_id), None)
    if not inv:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json() or {}
    inv.update({k: v for k, v in data.items() if k not in ('id',)})
    return jsonify(_enrich(inv))
