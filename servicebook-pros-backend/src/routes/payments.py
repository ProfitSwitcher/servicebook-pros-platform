from flask import Blueprint, jsonify

payments_bp = Blueprint('payments', __name__)

_customer_map = {1: 'John Smith', 2: 'Sarah Johnson', 3: 'Mike Davis'}

_payments = [
    {'id': 1, 'invoice_id': 1, 'amount': 1850.00, 'method': 'credit_card', 'status': 'completed', 'date': '2024-12-20'},
    {'id': 2, 'invoice_id': 2, 'amount': 423.70,  'method': 'check',       'status': 'pending',   'date': '2024-12-22'},
]

def _enrich(p):
    return {
        **p,
        # MyMoneyPage uses payment_date for depositDate
        'payment_date': p['date'],
        # Friendly method label
        'payment_method': p['method'].replace('_', ' ').title(),
        'customer_name': _customer_map.get(p['invoice_id'], 'Customer'),
        'total_amount': p['amount'],
    }

@payments_bp.route('/', methods=['GET'])
def get_payments():
    return jsonify([_enrich(p) for p in _payments])
