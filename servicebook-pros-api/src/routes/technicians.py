from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.technician import (
    Technician, JobAssignment, TimeEntry, TechnicianSchedule, MaterialRequest,
    TechnicianSkillLevel, TechnicianStatus, ScheduleStatus
)
from src.routes.auth import token_required
from datetime import datetime, date, time, timedelta
from sqlalchemy import func, and_, or_
import json

technicians_bp = Blueprint('technicians', __name__)

@technicians_bp.route('/technicians', methods=['GET'])
@token_required
def get_technicians(current_user):
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        status = request.args.get('status', '')
        skill_level = request.args.get('skill_level', '')
        search = request.args.get('search', '')
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        
        # Build query
        query = Technician.query.filter_by(company_id=current_user.company_id)
        
        # Apply filters
        if active_only:
            query = query.filter_by(status=TechnicianStatus.ACTIVE)
        elif status:
            query = query.filter_by(status=TechnicianStatus(status))
            
        if skill_level:
            query = query.filter_by(skill_level=TechnicianSkillLevel(skill_level))
            
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Technician.first_name.ilike(search_term),
                    Technician.last_name.ilike(search_term),
                    Technician.employee_id.ilike(search_term),
                    Technician.email.ilike(search_term),
                    Technician.phone.ilike(search_term)
                )
            )
        
        # Order by name
        query = query.order_by(Technician.first_name, Technician.last_name)
        
        # Paginate
        technicians = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'technicians': [tech.to_dict() for tech in technicians.items],
            'total': technicians.total,
            'pages': technicians.pages,
            'current_page': technicians.page,
            'per_page': technicians.per_page,
            'has_next': technicians.has_next,
            'has_prev': technicians.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get technicians: {str(e)}'}), 500

@technicians_bp.route('/technicians/<int:tech_id>', methods=['GET'])
@token_required
def get_technician(current_user, tech_id):
    try:
        technician = Technician.query.filter_by(
            id=tech_id, 
            company_id=current_user.company_id
        ).first()
        
        if not technician:
            return jsonify({'message': 'Technician not found'}), 404
        
        # Get recent job assignments
        recent_assignments = JobAssignment.query.filter_by(
            technician_id=tech_id,
            company_id=current_user.company_id
        ).order_by(JobAssignment.scheduled_start.desc()).limit(10).all()
        
        # Get current week's schedule
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        weekly_schedule = TechnicianSchedule.query.filter(
            and_(
                TechnicianSchedule.technician_id == tech_id,
                TechnicianSchedule.company_id == current_user.company_id,
                TechnicianSchedule.schedule_date >= week_start,
                TechnicianSchedule.schedule_date <= week_end
            )
        ).order_by(TechnicianSchedule.schedule_date).all()
        
        technician_data = technician.to_dict()
        technician_data['recent_assignments'] = [assignment.to_dict() for assignment in recent_assignments]
        technician_data['weekly_schedule'] = [schedule.to_dict() for schedule in weekly_schedule]
        
        return jsonify(technician_data), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get technician: {str(e)}'}), 500

@technicians_bp.route('/technicians', methods=['POST'])
@token_required
def create_technician(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['employee_id', 'first_name', 'last_name', 'hire_date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if employee ID already exists for this company
        existing_tech = Technician.query.filter_by(
            company_id=current_user.company_id,
            employee_id=data['employee_id']
        ).first()
        
        if existing_tech:
            return jsonify({'message': 'Employee ID already exists'}), 400
        
        # Parse hire date
        hire_date = datetime.fromisoformat(data['hire_date'].replace('Z', '+00:00'))
        
        # Create technician
        technician = Technician(
            company_id=current_user.company_id,
            employee_id=data['employee_id'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data.get('email'),
            phone=data.get('phone'),
            mobile_phone=data.get('mobile_phone'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            zip_code=data.get('zip_code'),
            hire_date=hire_date,
            status=TechnicianStatus(data.get('status', 'active')),
            skill_level=TechnicianSkillLevel(data.get('skill_level', 'journeyman')),
            specialties=json.dumps(data.get('specialties', [])),
            certifications=json.dumps(data.get('certifications', [])),
            licenses=json.dumps(data.get('licenses', [])),
            works_weekends=data.get('works_weekends', False),
            available_for_emergency=data.get('available_for_emergency', True),
            hourly_rate=data.get('hourly_rate'),
            overtime_rate=data.get('overtime_rate'),
            commission_rate=data.get('commission_rate', 0.0),
            vehicle_assigned=data.get('vehicle_assigned'),
            vehicle_license_plate=data.get('vehicle_license_plate'),
            equipment_assigned=json.dumps(data.get('equipment_assigned', [])),
            emergency_contact_name=data.get('emergency_contact_name'),
            emergency_contact_phone=data.get('emergency_contact_phone'),
            emergency_contact_relationship=data.get('emergency_contact_relationship'),
            notes=data.get('notes')
        )
        
        # Set default work hours if provided
        if data.get('default_start_time'):
            start_time_str = data['default_start_time']
            technician.default_start_time = datetime.strptime(start_time_str, '%H:%M').time()
            
        if data.get('default_end_time'):
            end_time_str = data['default_end_time']
            technician.default_end_time = datetime.strptime(end_time_str, '%H:%M').time()
        
        db.session.add(technician)
        db.session.commit()
        
        return jsonify({
            'message': 'Technician created successfully',
            'technician': technician.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create technician: {str(e)}'}), 500

@technicians_bp.route('/technicians/<int:tech_id>', methods=['PUT'])
@token_required
def update_technician(current_user, tech_id):
    try:
        technician = Technician.query.filter_by(
            id=tech_id, 
            company_id=current_user.company_id
        ).first()
        
        if not technician:
            return jsonify({'message': 'Technician not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        updatable_fields = [
            'first_name', 'last_name', 'email', 'phone', 'mobile_phone',
            'address', 'city', 'state', 'zip_code', 'works_weekends',
            'available_for_emergency', 'hourly_rate', 'overtime_rate', 'commission_rate',
            'vehicle_assigned', 'vehicle_license_plate', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relationship', 'notes'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(technician, field, data[field])
        
        # Handle special fields
        if 'status' in data:
            technician.status = TechnicianStatus(data['status'])
            
        if 'skill_level' in data:
            technician.skill_level = TechnicianSkillLevel(data['skill_level'])
            
        if 'specialties' in data:
            technician.specialties = json.dumps(data['specialties'])
            
        if 'certifications' in data:
            technician.certifications = json.dumps(data['certifications'])
            
        if 'licenses' in data:
            technician.licenses = json.dumps(data['licenses'])
            
        if 'equipment_assigned' in data:
            technician.equipment_assigned = json.dumps(data['equipment_assigned'])
            
        if 'default_start_time' in data:
            start_time_str = data['default_start_time']
            technician.default_start_time = datetime.strptime(start_time_str, '%H:%M').time()
            
        if 'default_end_time' in data:
            end_time_str = data['default_end_time']
            technician.default_end_time = datetime.strptime(end_time_str, '%H:%M').time()
        
        technician.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Technician updated successfully',
            'technician': technician.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update technician: {str(e)}'}), 500

@technicians_bp.route('/technicians/<int:tech_id>/assignments', methods=['GET'])
@token_required
def get_technician_assignments(current_user, tech_id):
    try:
        # Verify technician belongs to company
        technician = Technician.query.filter_by(
            id=tech_id,
            company_id=current_user.company_id
        ).first()
        
        if not technician:
            return jsonify({'message': 'Technician not found'}), 404
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        status = request.args.get('status')
        
        query = JobAssignment.query.filter_by(
            technician_id=tech_id,
            company_id=current_user.company_id
        )
        
        # Apply date filters
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(JobAssignment.scheduled_start >= start_dt)
            
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(JobAssignment.scheduled_end <= end_dt)
            
        if status:
            query = query.filter_by(status=ScheduleStatus(status))
        
        assignments = query.order_by(JobAssignment.scheduled_start).all()
        
        return jsonify({
            'assignments': [assignment.to_dict() for assignment in assignments]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get technician assignments: {str(e)}'}), 500

@technicians_bp.route('/technicians/<int:tech_id>/time-entries', methods=['GET'])
@token_required
def get_technician_time_entries(current_user, tech_id):
    try:
        # Verify technician belongs to company
        technician = Technician.query.filter_by(
            id=tech_id,
            company_id=current_user.company_id
        ).first()
        
        if not technician:
            return jsonify({'message': 'Technician not found'}), 404
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        job_id = request.args.get('job_id', type=int)
        
        query = TimeEntry.query.filter_by(
            technician_id=tech_id,
            company_id=current_user.company_id
        )
        
        # Apply filters
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(TimeEntry.start_time >= start_dt)
            
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(TimeEntry.start_time <= end_dt)
            
        if job_id:
            query = query.filter_by(job_id=job_id)
        
        time_entries = query.order_by(TimeEntry.start_time.desc()).all()
        
        return jsonify({
            'time_entries': [entry.to_dict() for entry in time_entries]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get time entries: {str(e)}'}), 500

@technicians_bp.route('/technicians/<int:tech_id>/clock-in', methods=['POST'])
@token_required
def clock_in_technician(current_user, tech_id):
    try:
        # Verify technician belongs to company
        technician = Technician.query.filter_by(
            id=tech_id,
            company_id=current_user.company_id
        ).first()
        
        if not technician:
            return jsonify({'message': 'Technician not found'}), 404
        
        data = request.get_json()
        
        # Check if technician is already clocked in
        active_entry = TimeEntry.query.filter_by(
            technician_id=tech_id,
            company_id=current_user.company_id,
            end_time=None
        ).first()
        
        if active_entry:
            return jsonify({'message': 'Technician is already clocked in'}), 400
        
        # Create time entry
        time_entry = TimeEntry(
            technician_id=tech_id,
            company_id=current_user.company_id,
            job_id=data.get('job_id'),
            start_time=datetime.utcnow(),
            time_type=data.get('time_type', 'regular'),
            is_billable=data.get('is_billable', True),
            clock_in_location=data.get('location'),
            gps_coordinates_in=data.get('gps_coordinates'),
            work_description=data.get('work_description'),
            notes=data.get('notes')
        )
        
        db.session.add(time_entry)
        db.session.commit()
        
        return jsonify({
            'message': 'Technician clocked in successfully',
            'time_entry': time_entry.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to clock in technician: {str(e)}'}), 500

@technicians_bp.route('/technicians/<int:tech_id>/clock-out', methods=['POST'])
@token_required
def clock_out_technician(current_user, tech_id):
    try:
        # Find active time entry
        active_entry = TimeEntry.query.filter_by(
            technician_id=tech_id,
            company_id=current_user.company_id,
            end_time=None
        ).first()
        
        if not active_entry:
            return jsonify({'message': 'No active time entry found'}), 404
        
        data = request.get_json()
        
        # Update time entry
        active_entry.end_time = datetime.utcnow()
        active_entry.clock_out_location = data.get('location')
        active_entry.gps_coordinates_out = data.get('gps_coordinates')
        active_entry.break_time_hours = data.get('break_time_hours', 0.0)
        
        # Calculate total hours
        time_diff = active_entry.end_time - active_entry.start_time
        total_hours = time_diff.total_seconds() / 3600
        active_entry.total_hours = total_hours - active_entry.break_time_hours
        active_entry.billable_hours = active_entry.total_hours if active_entry.is_billable else 0
        
        # Update work description and tasks
        if data.get('work_description'):
            active_entry.work_description = data['work_description']
        if data.get('tasks_completed'):
            active_entry.tasks_completed = json.dumps(data['tasks_completed'])
        if data.get('materials_used'):
            active_entry.materials_used = json.dumps(data['materials_used'])
        if data.get('notes'):
            active_entry.notes = data['notes']
        
        active_entry.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Technician clocked out successfully',
            'time_entry': active_entry.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to clock out technician: {str(e)}'}), 500

@technicians_bp.route('/material-requests', methods=['GET'])
@token_required
def get_material_requests(current_user):
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        status = request.args.get('status', '')
        urgent_only = request.args.get('urgent_only', 'false').lower() == 'true'
        technician_id = request.args.get('technician_id', type=int)
        job_id = request.args.get('job_id', type=int)
        
        query = MaterialRequest.query.filter_by(company_id=current_user.company_id)
        
        # Apply filters
        if status:
            query = query.filter_by(status=status)
            
        if urgent_only:
            query = query.filter_by(is_urgent=True)
            
        if technician_id:
            query = query.filter_by(technician_id=technician_id)
            
        if job_id:
            query = query.filter_by(job_id=job_id)
        
        # Order by urgency and creation date
        query = query.order_by(MaterialRequest.is_urgent.desc(), MaterialRequest.created_at.desc())
        
        # Paginate
        requests = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'material_requests': [req.to_dict() for req in requests.items],
            'total': requests.total,
            'pages': requests.pages,
            'current_page': requests.page,
            'per_page': requests.per_page,
            'has_next': requests.has_next,
            'has_prev': requests.has_prev
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get material requests: {str(e)}'}), 500

@technicians_bp.route('/material-requests', methods=['POST'])
@token_required
def create_material_request(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['job_id', 'technician_id', 'item_description', 'quantity_needed']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Create material request
        material_request = MaterialRequest(
            job_id=data['job_id'],
            technician_id=data['technician_id'],
            company_id=current_user.company_id,
            request_type=data.get('request_type', 'material'),
            priority=data.get('priority', 'normal'),
            is_urgent=data.get('is_urgent', False),
            item_description=data['item_description'],
            quantity_needed=data['quantity_needed'],
            unit_of_measure=data.get('unit_of_measure', 'each'),
            estimated_cost=data.get('estimated_cost'),
            inventory_item_id=data.get('inventory_item_id'),
            reason_needed=data.get('reason_needed'),
            job_impact=data.get('job_impact'),
            alternative_options=data.get('alternative_options'),
            delivery_location=data.get('delivery_location'),
            delivery_instructions=data.get('delivery_instructions'),
            notes=data.get('notes')
        )
        
        db.session.add(material_request)
        db.session.commit()
        
        return jsonify({
            'message': 'Material request created successfully',
            'material_request': material_request.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create material request: {str(e)}'}), 500

@technicians_bp.route('/technicians/dashboard', methods=['GET'])
@token_required
def get_technicians_dashboard(current_user):
    try:
        # Get summary statistics
        total_technicians = Technician.query.filter_by(
            company_id=current_user.company_id,
            status=TechnicianStatus.ACTIVE
        ).count()
        
        # Get technicians currently working
        currently_working = db.session.query(func.count(func.distinct(TimeEntry.technician_id))).filter(
            and_(
                TimeEntry.company_id == current_user.company_id,
                TimeEntry.end_time.is_(None)
            )
        ).scalar() or 0
        
        # Get pending material requests
        pending_requests = MaterialRequest.query.filter_by(
            company_id=current_user.company_id,
            status='pending'
        ).count()
        
        urgent_requests = MaterialRequest.query.filter_by(
            company_id=current_user.company_id,
            is_urgent=True,
            status='pending'
        ).count()
        
        # Get today's assignments
        today = date.today()
        today_assignments = JobAssignment.query.filter(
            and_(
                JobAssignment.company_id == current_user.company_id,
                func.date(JobAssignment.scheduled_start) == today
            )
        ).count()
        
        return jsonify({
            'summary': {
                'total_technicians': total_technicians,
                'currently_working': currently_working,
                'pending_material_requests': pending_requests,
                'urgent_material_requests': urgent_requests,
                'today_assignments': today_assignments
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get technicians dashboard: {str(e)}'}), 500

