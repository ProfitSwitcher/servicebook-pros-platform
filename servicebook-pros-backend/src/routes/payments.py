from flask import Blueprint, jsonify

payments_bp = Blueprint('payments', __name__)

_payments = [
    {'id': 1, 'invoice_id': 1, 'amount': 1850.00, 'method': 'credit_card', 'status': 'completed', 'date': '2024-12-20'},
    {'id': 2, 'invoice_id': 2, 'amount': 423.70, 'method': 'check', 'status': 'pending', 'date': '2024-12-22'},
]

@payments_bp.route('/', methods=['GET'])
def get_payments():
    return jsonify(_payments)
