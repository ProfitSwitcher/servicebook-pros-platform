from flask import Blueprint, request, jsonify
from src.routes.auth import token_required

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/settings', methods=['GET'])
@token_required
def get_settings(current_user):
    try:
        # Return basic settings for now
        return jsonify({
            'company_settings': {
                'name': current_user.company.name if current_user.company else 'Demo Company',
                'timezone': 'America/New_York',
                'currency': 'USD',
                'tax_rate': 8.5
            },
            'user_settings': {
                'notifications': True,
                'email_alerts': True,
                'theme': 'light'
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get settings: {str(e)}'}), 500

@settings_bp.route('/settings', methods=['PUT'])
@token_required
def update_settings(current_user):
    try:
        data = request.get_json()
        
        # In a real implementation, you would update the settings in the database
        # For now, just return success
        
        return jsonify({
            'message': 'Settings updated successfully',
            'settings': data
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to update settings: {str(e)}'}), 500

