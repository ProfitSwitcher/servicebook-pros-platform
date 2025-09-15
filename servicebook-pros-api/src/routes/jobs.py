from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.job import Job, JobStatus, JobPriority, JobNote, JobTimeEntry
from src.models.customer import Customer
from src.routes.auth import token_required
from datetime import datetime, time
import json

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/jobs', methods=['GET'])
@token_required
def get_jobs(current_user):
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        status = request.args.get('status', '')
        technician_id = request.args.get('technician_id', type=int)
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        search = request.args.get('search', '')
        
        # Build query
        query = Job.query.filter_by(company_id=current_user.company_id)
        
        # Apply filters
        if status:
            query = query.filter_by(status=JobStatus(status))
            
        if technician_id:
            query = query.filter_by(assigned_technician_id=technician_id)
            
        if date_from:
            date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            query = query.filter(Job.scheduled_date >= date_from_obj)
            
        if date_to:
            date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            query = query.filter(Job.scheduled_date <= date_to_obj)
            
        if search:
            search_term = f"%{search}%"
            query = query.join(Customer).filter(
                db.or_(
                    Job.job_number.ilike(search_term),
                    Job.title.ilike(search_term),
                    Job.description.ilike(search_term),
                    Customer.first_name.ilike(search_term),
                    Customer.last_name.ilike(search_term)
                )
            )
        
        # Order by scheduled date
        query = query.order_by(Job.scheduled_date.desc())
        
        # Paginate
        jobs = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Include customer info in response
        jobs_data = []
        for job in jobs.items:
            job_data = job.to_dict()
            if job.customer:
                job_data['customer'] = {
                    'id': job.customer.id,
                    'name': job.customer.display_name,
                    'phone': job.customer.phone,
                    'email': job.customer.email
                }
            jobs_data.append(job_data)
        
        return jsonify({
            'jobs': jobs_data,
            'total': jobs.total,
            'pages': jobs.pages,
            'current_page': jobs.page,
            'per_page': jobs.per_page,
            'has_next': jobs.has_next,
            'has_prev': jobs.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get jobs: {str(e)}'}), 500

@jobs_bp.route('/jobs/<int:job_id>', methods=['GET'])
@token_required
def get_job(current_user, job_id):
    try:
        job = Job.query.filter_by(
            id=job_id, 
            company_id=current_user.company_id
        ).first()
        
        if not job:
            return jsonify({'message': 'Job not found'}), 404
        
        # Include related data
        job_data = job.to_dict()
        
        if job.customer:
            job_data['customer'] = job.customer.to_dict()
            
        if job.assigned_technician:
            job_data['assigned_technician'] = {
                'id': job.assigned_technician.id,
                'name': f"{job.assigned_technician.first_name} {job.assigned_technician.last_name}",
                'email': job.assigned_technician.email,
                'phone': job.assigned_technician.phone
            }
        
        # Include notes and time entries
        job_data['notes'] = [note.to_dict() for note in job.notes]
        job_data['time_entries'] = [entry.to_dict() for entry in job.time_entries]
        
        return jsonify(job_data), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get job: {str(e)}'}), 500

@jobs_bp.route('/jobs', methods=['POST'])
@token_required
def create_job(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customer_id', 'title']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Verify customer exists and belongs to company
        customer = Customer.query.filter_by(
            id=data['customer_id'],
            company_id=current_user.company_id
        ).first()
        
        if not customer:
            return jsonify({'message': 'Customer not found'}), 404
        
        # Generate job number
        job_count = Job.query.filter_by(company_id=current_user.company_id).count()
        job_number = f"JOB-{job_count + 1:06d}"
        
        # Parse scheduled date and times
        scheduled_date = None
        scheduled_start_time = None
        scheduled_end_time = None
        
        if data.get('scheduled_date'):
            scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
            
        if data.get('scheduled_start_time'):
            scheduled_start_time = time.fromisoformat(data['scheduled_start_time'])
            
        if data.get('scheduled_end_time'):
            scheduled_end_time = time.fromisoformat(data['scheduled_end_time'])
        
        # Create job
        job = Job(
            company_id=current_user.company_id,
            customer_id=data['customer_id'],
            job_number=job_number,
            title=data['title'],
            description=data.get('description'),
            job_type=data.get('job_type'),
            category=data.get('category'),
            priority=JobPriority(data['priority']) if data.get('priority') else JobPriority.NORMAL,
            status=JobStatus(data['status']) if data.get('status') else JobStatus.SCHEDULED,
            scheduled_date=scheduled_date,
            scheduled_start_time=scheduled_start_time,
            scheduled_end_time=scheduled_end_time,
            estimated_duration=data.get('estimated_duration'),
            service_address=data.get('service_address') or customer.address,
            service_city=data.get('service_city') or customer.city,
            service_state=data.get('service_state') or customer.state,
            service_zip=data.get('service_zip') or customer.zip_code,
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            assigned_technician_id=data.get('assigned_technician_id'),
            team_members=json.dumps(data.get('team_members', [])),
            scope_of_work=data.get('scope_of_work'),
            special_instructions=data.get('special_instructions'),
            materials_needed=json.dumps(data.get('materials_needed', [])),
            tools_needed=json.dumps(data.get('tools_needed', [])),
            urgent_materials=json.dumps(data.get('urgent_materials', [])),
            estimated_cost=data.get('estimated_cost', 0.0),
            labor_rate=data.get('labor_rate', 75.0)
        )
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'message': 'Job created successfully',
            'job': job.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create job: {str(e)}'}), 500

@jobs_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@token_required
def update_job(current_user, job_id):
    try:
        job = Job.query.filter_by(
            id=job_id, 
            company_id=current_user.company_id
        ).first()
        
        if not job:
            return jsonify({'message': 'Job not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        updatable_fields = [
            'title', 'description', 'job_type', 'category', 'estimated_duration',
            'service_address', 'service_city', 'service_state', 'service_zip',
            'latitude', 'longitude', 'assigned_technician_id', 'scope_of_work',
            'special_instructions', 'estimated_cost', 'actual_cost', 'labor_hours',
            'labor_rate', 'customer_notified', 'customer_signature', 
            'customer_feedback', 'customer_rating'
        ]
        
        for field in updatable_fields:
            if field in data:
                if field in ['team_members', 'materials_needed', 'tools_needed', 'urgent_materials']:
                    setattr(job, field, json.dumps(data[field]))
                else:
                    setattr(job, field, data[field])
        
        # Handle enum fields
        if 'priority' in data:
            job.priority = JobPriority(data['priority'])
            
        if 'status' in data:
            old_status = job.status
            new_status = JobStatus(data['status'])
            job.status = new_status
            
            # Handle status changes
            if new_status == JobStatus.COMPLETED and old_status != JobStatus.COMPLETED:
                job.completed_at = datetime.utcnow()
                if not job.actual_end_time:
                    job.actual_end_time = datetime.utcnow()
            elif new_status == JobStatus.IN_PROGRESS and not job.actual_start_time:
                job.actual_start_time = datetime.utcnow()
        
        # Handle date/time fields
        if 'scheduled_date' in data and data['scheduled_date']:
            job.scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
            
        if 'scheduled_start_time' in data and data['scheduled_start_time']:
            job.scheduled_start_time = time.fromisoformat(data['scheduled_start_time'])
            
        if 'scheduled_end_time' in data and data['scheduled_end_time']:
            job.scheduled_end_time = time.fromisoformat(data['scheduled_end_time'])
        
        job.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Job updated successfully',
            'job': job.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update job: {str(e)}'}), 500

@jobs_bp.route('/jobs/<int:job_id>/notes', methods=['GET'])
@token_required
def get_job_notes(current_user, job_id):
    try:
        job = Job.query.filter_by(
            id=job_id, 
            company_id=current_user.company_id
        ).first()
        
        if not job:
            return jsonify({'message': 'Job not found'}), 404
        
        notes = JobNote.query.filter_by(job_id=job_id)\
            .order_by(JobNote.created_at.desc()).all()
        
        return jsonify({
            'notes': [note.to_dict() for note in notes]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get job notes: {str(e)}'}), 500

@jobs_bp.route('/jobs/<int:job_id>/notes', methods=['POST'])
@token_required
def create_job_note(current_user, job_id):
    try:
        job = Job.query.filter_by(
            id=job_id, 
            company_id=current_user.company_id
        ).first()
        
        if not job:
            return jsonify({'message': 'Job not found'}), 404
        
        data = request.get_json()
        
        if not data.get('content'):
            return jsonify({'message': 'Note content is required'}), 400
        
        note = JobNote(
            job_id=job_id,
            user_id=current_user.id,
            note_type=data.get('note_type', 'general'),
            title=data.get('title'),
            content=data['content'],
            is_internal=data.get('is_internal', False),
            is_customer_visible=data.get('is_customer_visible', True)
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            'message': 'Note created successfully',
            'note': note.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create note: {str(e)}'}), 500

@jobs_bp.route('/jobs/<int:job_id>/time-entries', methods=['GET'])
@token_required
def get_job_time_entries(current_user, job_id):
    try:
        job = Job.query.filter_by(
            id=job_id, 
            company_id=current_user.company_id
        ).first()
        
        if not job:
            return jsonify({'message': 'Job not found'}), 404
        
        time_entries = JobTimeEntry.query.filter_by(job_id=job_id)\
            .order_by(JobTimeEntry.start_time.desc()).all()
        
        return jsonify({
            'time_entries': [entry.to_dict() for entry in time_entries]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get time entries: {str(e)}'}), 500

@jobs_bp.route('/jobs/<int:job_id>/time-entries', methods=['POST'])
@token_required
def create_time_entry(current_user, job_id):
    try:
        job = Job.query.filter_by(
            id=job_id, 
            company_id=current_user.company_id
        ).first()
        
        if not job:
            return jsonify({'message': 'Job not found'}), 404
        
        data = request.get_json()
        
        if not data.get('start_time'):
            return jsonify({'message': 'Start time is required'}), 400
        
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        end_time = None
        duration_minutes = None
        
        if data.get('end_time'):
            end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
            duration_minutes = int((end_time - start_time).total_seconds() / 60)
        elif data.get('duration_minutes'):
            duration_minutes = data['duration_minutes']
        
        time_entry = JobTimeEntry(
            job_id=job_id,
            user_id=current_user.id,
            start_time=start_time,
            end_time=end_time,
            duration_minutes=duration_minutes,
            work_description=data.get('work_description'),
            billable=data.get('billable', True),
            hourly_rate=data.get('hourly_rate', job.labor_rate)
        )
        
        db.session.add(time_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Time entry created successfully',
            'time_entry': time_entry.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create time entry: {str(e)}'}), 500

@jobs_bp.route('/jobs/calendar', methods=['GET'])
@token_required
def get_jobs_calendar(current_user):
    try:
        # Get date range from query parameters
        start_date = request.args.get('start', '')
        end_date = request.args.get('end', '')
        
        query = Job.query.filter_by(company_id=current_user.company_id)
        
        if start_date:
            start_date_obj = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(Job.scheduled_date >= start_date_obj)
            
        if end_date:
            end_date_obj = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(Job.scheduled_date <= end_date_obj)
        
        jobs = query.all()
        
        # Format for calendar
        calendar_events = []
        for job in jobs:
            if job.scheduled_date:
                event = {
                    'id': job.id,
                    'title': f"{job.title} - {job.customer.display_name if job.customer else 'Unknown'}",
                    'start': job.scheduled_date.isoformat(),
                    'end': job.scheduled_date.isoformat(),
                    'allDay': True,
                    'backgroundColor': self._get_status_color(job.status),
                    'borderColor': self._get_status_color(job.status),
                    'extendedProps': {
                        'job_id': job.id,
                        'customer_name': job.customer.display_name if job.customer else 'Unknown',
                        'status': job.status.value,
                        'priority': job.priority.value if job.priority else 'normal',
                        'technician': job.assigned_technician.first_name + ' ' + job.assigned_technician.last_name if job.assigned_technician else None
                    }
                }
                calendar_events.append(event)
        
        return jsonify(calendar_events), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get calendar jobs: {str(e)}'}), 500

def _get_status_color(status):
    """Get color for job status"""
    colors = {
        JobStatus.SCHEDULED: '#3b82f6',  # blue
        JobStatus.IN_PROGRESS: '#f59e0b',  # amber
        JobStatus.ON_HOLD: '#ef4444',  # red
        JobStatus.COMPLETED: '#10b981',  # green
        JobStatus.CANCELLED: '#6b7280',  # gray
        JobStatus.INVOICED: '#8b5cf6'  # purple
    }
    return colors.get(status, '#6b7280')

@jobs_bp.route('/jobs/stats', methods=['GET'])
@token_required
def get_job_stats(current_user):
    try:
        total_jobs = Job.query.filter_by(company_id=current_user.company_id).count()
        scheduled_jobs = Job.query.filter_by(
            company_id=current_user.company_id, 
            status=JobStatus.SCHEDULED
        ).count()
        in_progress_jobs = Job.query.filter_by(
            company_id=current_user.company_id, 
            status=JobStatus.IN_PROGRESS
        ).count()
        completed_jobs = Job.query.filter_by(
            company_id=current_user.company_id, 
            status=JobStatus.COMPLETED
        ).count()
        
        return jsonify({
            'total_jobs': total_jobs,
            'scheduled_jobs': scheduled_jobs,
            'in_progress_jobs': in_progress_jobs,
            'completed_jobs': completed_jobs,
            'on_hold_jobs': Job.query.filter_by(
                company_id=current_user.company_id, 
                status=JobStatus.ON_HOLD
            ).count(),
            'cancelled_jobs': Job.query.filter_by(
                company_id=current_user.company_id, 
                status=JobStatus.CANCELLED
            ).count()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get job stats: {str(e)}'}), 500

