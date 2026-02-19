from flask import Blueprint, jsonify, request
from datetime import datetime

jobs_bp = Blueprint('jobs', __name__)

_jobs = [
    {'id': 1, 'title': 'Panel Upgrade', 'customer_id': 1, 'customer_name': 'John Smith', 'status': 'scheduled', 'scheduled_date': '2024-12-20', 'total': 1850.00},
    {'id': 2, 'title': 'Outlet Installation', 'customer_id': 2, 'customer_name': 'Sarah Johnson', 'status': 'in_progress', 'scheduled_date': '2024-12-18', 'total': 423.70},
    {'id': 3, 'title': 'Lighting Retrofit', 'customer_id': 3, 'customer_name': 'Mike Davis', 'status': 'completed', 'scheduled_date': '2024-12-15', 'total': 675.00},
]
_next_id = 4

@jobs_bp.route('/', methods=['GET'])
def get_jobs():
    return jsonify(_jobs)

@jobs_bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    j = next((j for j in _jobs if j['id'] == job_id), None)
    if not j:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(j)

@jobs_bp.route('/', methods=['POST'])
def create_job():
    global _next_id
    data = request.get_json() or {}
    job = {
        'id': _next_id,
        'title': data.get('title', ''),
        'customer_id': data.get('customer_id'),
        'customer_name': data.get('customer_name', ''),
        'status': data.get('status', 'scheduled'),
        'scheduled_date': data.get('scheduled_date', datetime.utcnow().strftime('%Y-%m-%d')),
        'total': data.get('total', 0.0),
    }
    _jobs.append(job)
    _next_id += 1
    return jsonify(job), 201

@jobs_bp.route('/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    j = next((j for j in _jobs if j['id'] == job_id), None)
    if not j:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json() or {}
    j.update({k: v for k, v in data.items() if k != 'id'})
    return jsonify(j)
