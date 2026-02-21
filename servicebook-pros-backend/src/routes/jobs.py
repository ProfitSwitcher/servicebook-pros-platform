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
    {'id': 1,  'title': 'Panel Upgrade 200A',       'customer_id': 1,  'customer_name': 'John Smith',      'status': 'completed',   'scheduled_date': '2024-11-20', 'total': 1850.00, 'job_number': 'JOB-1001', 'description': 'Upgrade main electrical panel to 200A service'},
    {'id': 2,  'title': 'Outlet Installation',       'customer_id': 2,  'customer_name': 'Sarah Johnson',   'status': 'completed',   'scheduled_date': '2024-12-05', 'total': 423.70,  'job_number': 'JOB-1002', 'description': 'Install 6 new GFCI outlets in kitchen'},
    {'id': 3,  'title': 'Lighting Retrofit',         'customer_id': 3,  'customer_name': 'Mike Davis',      'status': 'completed',   'scheduled_date': '2024-12-15', 'total': 675.00,  'job_number': 'JOB-1003', 'description': 'Replace fluorescent fixtures with LED throughout office'},
    {'id': 4,  'title': 'EV Charger Installation',   'customer_id': 4,  'customer_name': 'Lisa Chen',       'status': 'scheduled',   'scheduled_date': '2025-01-10', 'total': 1200.00, 'job_number': 'JOB-1004', 'description': 'Install Level 2 EV charger in garage'},
    {'id': 5,  'title': 'Generator Hookup',          'customer_id': 5,  'customer_name': 'Robert Williams', 'status': 'scheduled',   'scheduled_date': '2025-01-15', 'total': 2400.00, 'job_number': 'JOB-1005', 'description': 'Install transfer switch and connect standby generator'},
    {'id': 6,  'title': 'Smoke Detector Upgrade',    'customer_id': 6,  'customer_name': 'Jennifer Brown',  'status': 'in_progress', 'scheduled_date': '2025-01-18', 'total': 380.00,  'job_number': 'JOB-1006', 'description': 'Replace all smoke and CO detectors, hardwire interconnect'},
    {'id': 7,  'title': 'Ceiling Fan Installation',  'customer_id': 7,  'customer_name': 'David Martinez',  'status': 'in_progress', 'scheduled_date': '2025-01-20', 'total': 290.00,  'job_number': 'JOB-1007', 'description': 'Install 3 ceiling fans with remote controls'},
    {'id': 8,  'title': 'Service Upgrade 100A',      'customer_id': 8,  'customer_name': 'Amanda Taylor',   'status': 'pending',     'scheduled_date': '2025-02-01', 'total': 1650.00, 'job_number': 'JOB-1008', 'description': 'Upgrade electrical service and replace meter socket'},
    {'id': 9,  'title': 'Bath Exhaust Fan Install',  'customer_id': 9,  'customer_name': 'Thomas Anderson', 'status': 'pending',     'scheduled_date': '2025-02-10', 'total': 320.00,  'job_number': 'JOB-1009', 'description': 'Install exhaust fans in 2 bathrooms with timers'},
    {'id': 10, 'title': 'Outdoor Lighting',          'customer_id': 10, 'customer_name': 'Patricia Wilson', 'status': 'pending',     'scheduled_date': '2025-02-20', 'total': 890.00,  'job_number': 'JOB-1010', 'description': 'Install landscape and security lighting'},
]
_next_id = 11

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
