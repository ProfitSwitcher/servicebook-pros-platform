from flask import Blueprint, jsonify, request

communication_bp = Blueprint('communication', __name__)

@communication_bp.route('/sms', methods=['POST'])
def send_sms():
    data = request.get_json() or {}
    return jsonify({'success': True, 'message': 'SMS queued', 'to': data.get('to')})

@communication_bp.route('/email', methods=['POST'])
def send_email():
    data = request.get_json() or {}
    return jsonify({'success': True, 'message': 'Email queued', 'to': data.get('to')})
