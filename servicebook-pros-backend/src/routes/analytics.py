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

@analytics_bp.route('/summary', methods=['GET'])
def summary():
    """Flat structure expected by ComprehensiveDashboard."""
    return jsonify({
        'total_invoice_amount': 48250.00,
        'previous_period_revenue': 38950.00,
        'revenue_growth': 16.3,
        'completed_jobs': 128,
        'in_progress_jobs': 8,
        'scheduled_jobs': 6,
        'total_customers': 87,
        'new_customers': 12,
        'customer_retention': 94.2,
        'pending_estimates': 18,
        'approved_estimates': 34,
        'estimate_conversion': 65.4,
    })

@analytics_bp.route('/revenue-by-month', methods=['GET'])
def revenue_by_month():
    return jsonify([
        {'month': 'Jul', 'revenue': 8200},
        {'month': 'Aug', 'revenue': 9100},
        {'month': 'Sep', 'revenue': 10300},
        {'month': 'Oct', 'revenue': 9800},
        {'month': 'Nov', 'revenue': 11200},
        {'month': 'Dec', 'revenue': 10800},
        {'month': 'Jan', 'revenue': 12400},
    ])

@analytics_bp.route('/top-customers', methods=['GET'])
def top_customers():
    return jsonify([])

@analytics_bp.route('/reports', methods=['GET'])
def reports():
    return jsonify({'reports': []})
