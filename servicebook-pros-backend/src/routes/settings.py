from flask import Blueprint, jsonify, request

settings_bp = Blueprint('settings', __name__)

_settings = {
    # Company Profile
    'company_name': 'ServiceBook Pros',
    'phone': '855-710-2055',
    'address': 'Vestal, NY',
    'email': 'admin@servicebookpros.com',
    'timezone': 'America/New_York',
    'website': 'https://servicebookpros.com',
    'logo_url': '',
    'license_number': '',
    'insurance_number': '',

    # Business Hours (mon-sun, each has enabled bool + open/close time strings)
    'business_hours': {
        'monday':    {'enabled': True,  'open': '08:00', 'close': '17:00'},
        'tuesday':   {'enabled': True,  'open': '08:00', 'close': '17:00'},
        'wednesday': {'enabled': True,  'open': '08:00', 'close': '17:00'},
        'thursday':  {'enabled': True,  'open': '08:00', 'close': '17:00'},
        'friday':    {'enabled': True,  'open': '08:00', 'close': '17:00'},
        'saturday':  {'enabled': False, 'open': '09:00', 'close': '14:00'},
        'sunday':    {'enabled': False, 'open': '09:00', 'close': '14:00'},
    },

    # Notifications
    'notifications': {
        'new_job_email': True,
        'new_job_sms': True,
        'job_completed_email': True,
        'job_completed_sms': False,
        'new_estimate_email': True,
        'estimate_accepted_email': True,
        'invoice_paid_email': True,
        'invoice_paid_sms': False,
        'invoice_overdue_email': True,
        'new_customer_email': False,
        'review_received_email': True,
        'daily_summary_email': False,
    },

    # Login / Auth
    'two_factor_enabled': False,
    'session_timeout_hours': 24,

    # Jobs settings
    'job_number_prefix': 'JOB',
    'job_number_start': 1001,
    'job_auto_numbering': True,
    'job_default_status': 'pending',
    'job_require_signature': False,
    'job_allow_partial_payment': True,

    # Estimates settings
    'estimate_number_prefix': 'EST',
    'estimate_number_start': 1001,
    'estimate_validity_days': 30,
    'estimate_require_signature': False,
    'estimate_default_notes': '',
    'estimate_default_terms': 'Estimate valid for 30 days.',

    # Invoices settings
    'invoice_number_prefix': 'INV',
    'invoice_number_start': 1001,
    'invoice_payment_terms_days': 30,
    'invoice_late_fee_enabled': False,
    'invoice_late_fee_percent': 1.5,
    'invoice_default_notes': 'Thank you for your business!',
    'invoice_default_terms': 'Payment due within 30 days.',
    'invoice_accept_credit_card': True,
    'invoice_accept_check': True,
    'invoice_accept_cash': True,

    # Time Tracking
    'time_tracking_enabled': False,
    'time_rounding_minutes': 15,
    'overtime_after_hours': 8,
    'overtime_rate_multiplier': 1.5,

    # Lead Sources (list of strings)
    'lead_sources': [
        'Google Search',
        'Referral',
        'Social Media',
        'Direct Mail',
        'Yelp',
        'HomeAdvisor',
        'Thumbtack',
        'Door Hanger',
    ],

    # Tags (list of {name, color})
    'tags': [
        {'name': 'VIP', 'color': '#f59e0b'},
        {'name': 'Commercial', 'color': '#3b82f6'},
        {'name': 'Residential', 'color': '#10b981'},
        {'name': 'Follow Up', 'color': '#ef4444'},
        {'name': 'Seasonal', 'color': '#8b5cf6'},
    ],

    # Pipeline stages
    'pipeline_stages': [
        {'id': 1, 'name': 'New Lead', 'color': '#94a3b8'},
        {'id': 2, 'name': 'Contacted', 'color': '#3b82f6'},
        {'id': 3, 'name': 'Estimate Sent', 'color': '#f59e0b'},
        {'id': 4, 'name': 'Won', 'color': '#10b981'},
        {'id': 5, 'name': 'Lost', 'color': '#ef4444'},
    ],

    # Checklists
    'checklists': [
        {
            'id': 1,
            'name': 'Job Completion Checklist',
            'items': ['Take before/after photos', 'Clean up work area', 'Collect payment', 'Get customer signature', 'Send invoice']
        },
    ],

    # Customer Portal
    'customer_portal_enabled': False,
    'customer_portal_allow_booking': True,
    'customer_portal_allow_payments': True,
    'customer_portal_allow_history': True,

    # Online Booking
    'online_booking_enabled': False,
    'online_booking_require_deposit': False,
    'online_booking_deposit_percent': 25,
    'online_booking_buffer_minutes': 30,
    'online_booking_advance_days': 60,

    # Reviews
    'reviews_auto_request': False,
    'reviews_request_delay_hours': 24,
    'reviews_google_url': '',
    'reviews_yelp_url': '',
    'reviews_facebook_url': '',

    # Referral Program
    'referral_program_enabled': False,
    'referral_reward_type': 'discount',
    'referral_reward_value': 25,
    'referral_reward_description': '$25 off next service',

    # AI Team
    'ai_assistant_enabled': False,
    'ai_auto_followup': False,
    'ai_auto_estimate': False,
    'ai_response_style': 'professional',
}


@settings_bp.route('/', methods=['GET'])
def get_settings():
    return jsonify(_settings)


@settings_bp.route('/', methods=['PUT'])
def update_settings():
    data = request.get_json() or {}
    # Deep merge for dict values, replace for primitives and lists
    for key, value in data.items():
        if isinstance(value, dict) and isinstance(_settings.get(key), dict):
            _settings[key].update(value)
        else:
            _settings[key] = value
    return jsonify(_settings)
