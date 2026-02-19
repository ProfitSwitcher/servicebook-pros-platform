from flask import Blueprint, jsonify, request

settings_bp = Blueprint('settings', __name__)

_settings = {
    'company_name': 'ServiceBook Pros',
    'phone': '855-710-2055',
    'address': 'Vestal, NY',
    'email': 'admin@servicebookpros.com',
    'timezone': 'America/New_York',
}

@settings_bp.route('/', methods=['GET'])
def get_settings():
    return jsonify(_settings)

@settings_bp.route('/', methods=['PUT'])
def update_settings():
    data = request.get_json() or {}
    _settings.update(data)
    return jsonify(_settings)
