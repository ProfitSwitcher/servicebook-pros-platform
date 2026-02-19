from flask import Blueprint, jsonify, request
from datetime import datetime

jobs_bp = Blueprint('jobs', __name__)

def _enrich(j):
    parts = j['customer_name'].split(' ', 1)
    return {
        **j,
        'jobNumber': f"JOB-{str(j['id']).zfill(3)}",
        'totalAmount': j['total'],
        'customer': {
            'id': j['customer_id'],
            'name': j['customer_name'],
            'first_name': parts[0],
            'last_name': parts[1] if len(parts) > 1 else '',
            'phone': '',
            'email': '',
            'address': '',
        },
        'scheduledDate': j['scheduled_date'],
        'scheduledTime': '',
        'estimatedDuration': 2,
        'assignedTechnician': None,
        'priority': 'normal',
        'scopeOfWork': '',
        'notes': '',
        'materials': [],
        'urgentQuestions': [],
        'homeownerQuestions': [],
        'timeTracking': {'start': None, 'end': None, 'total': 0},
        'createdDate': j.get('created_at', j['scheduled_date']),
        'lastUpdated': j.get('created_at', j['scheduled_date']),
    }

_jobs = [
    {'id': 1, 'title': 'Panel Upgrade',      'customer_id': 1, 'customer_name': 'John Smith',    'status': 'scheduled',  'scheduled_date': '2024-12-20', 'total': 1850.00},
    {'id': 2, 'title': 'Outlet Installation', 'customer_id': 2, 'customer_name': 'Sarah Johnson', 'status': 'in_progress','scheduled_date': '2024-12-18', 'total': 423.70},
    {'id': 3, 'title': 'Lighting Retrofit',   'customer_id': 3, 'customer_name': 'Mike Davis',    'status': 'completed',  'scheduled_date': '2024-12-15', 'total': 675.00},
]
_next_id = 4

@jobs_bp.route('/', methods=['GET'])
def get_jobs():
    status = request.args.get('status')
    result = [j for j in _jobs if not status or j['status'] == status]
    return jsonify([_enrich(j) for j in result])

@jobs_bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    j = next((j for j in _jobs if j['id'] == job_id), None)
    if not j:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(_enrich(j))

@jobs_bp.route('/', methods=['POST'])
def create_job():
    global _next_id
    data = request.get_json() or {}
    job = {
        'id': _next_id,
        'title': data.get('title', ''),
        'customer_id': data.get('customer_id', 0),
        'customer_name': data.get('customer_name', ''),
        'status': data.get('status', 'scheduled'),
        'scheduled_date': data.get('scheduled_date', data.get('scheduledDate', datetime.utcnow().strftime('%Y-%m-%d'))),
        'total': float(data.get('total', data.get('totalAmount', 0))),
        'created_at': datetime.utcnow().strftime('%Y-%m-%d'),
    }
    _jobs.append(job)
    _next_id += 1
    return jsonify(_enrich(job)), 201

@jobs_bp.route('/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    j = next((j for j in _jobs if j['id'] == job_id), None)
    if not j:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json() or {}
    j.update({k: v for k, v in data.items() if k not in ('id',)})
    return jsonify(_enrich(j))

@jobs_bp.route('/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    global _jobs
    _jobs = [j for j in _jobs if j['id'] != job_id]
    return jsonify({'success': True})
