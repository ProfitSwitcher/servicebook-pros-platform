from flask import Blueprint, jsonify

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
def dashboard():
    return jsonify({
        'revenue': {'total': 48250.00, 'this_month': 12400.00, 'last_month': 10800.00},
        'jobs': {'total': 142, 'completed': 128, 'in_progress': 8, 'scheduled': 6},
        'customers': {'total': 87, 'new_this_month': 12},
        'invoices': {'paid': 38500.00, 'pending': 5200.00, 'overdue': 4550.00},
    })

@analytics_bp.route('/reports', methods=['GET'])
def reports():
    return jsonify({'reports': []})
