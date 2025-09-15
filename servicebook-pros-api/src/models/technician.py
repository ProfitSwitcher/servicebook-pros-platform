from src.models.user import db
from datetime import datetime, time
import enum
import json

class TechnicianSkillLevel(enum.Enum):
    APPRENTICE = 'apprentice'
    JOURNEYMAN = 'journeyman'
    MASTER = 'master'
    SPECIALIST = 'specialist'

class TechnicianStatus(enum.Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    ON_LEAVE = 'on_leave'
    TERMINATED = 'terminated'

class ScheduleStatus(enum.Enum):
    SCHEDULED = 'scheduled'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    NO_SHOW = 'no_show'

class Technician(db.Model):
    __tablename__ = 'technicians'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Link to user account if they have one
    
    # Personal information
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    mobile_phone = db.Column(db.String(20))
    
    # Address
    address = db.Column(db.String(200))
    city = db.Column(db.String(100))
    state = db.Column(db.String(50))
    zip_code = db.Column(db.String(20))
    
    # Employment details
    hire_date = db.Column(db.DateTime, nullable=False)
    termination_date = db.Column(db.DateTime)
    status = db.Column(db.Enum(TechnicianStatus), default=TechnicianStatus.ACTIVE)
    
    # Skills and certifications
    skill_level = db.Column(db.Enum(TechnicianSkillLevel), default=TechnicianSkillLevel.JOURNEYMAN)
    specialties = db.Column(db.Text)  # JSON array of specialties
    certifications = db.Column(db.Text)  # JSON array of certifications
    licenses = db.Column(db.Text)  # JSON array of licenses
    
    # Work schedule
    default_start_time = db.Column(db.Time, default=time(8, 0))  # 8:00 AM
    default_end_time = db.Column(db.Time, default=time(17, 0))   # 5:00 PM
    works_weekends = db.Column(db.Boolean, default=False)
    available_for_emergency = db.Column(db.Boolean, default=True)
    
    # Compensation
    hourly_rate = db.Column(db.Float)
    overtime_rate = db.Column(db.Float)
    commission_rate = db.Column(db.Float, default=0.0)
    
    # Performance metrics
    efficiency_rating = db.Column(db.Float, default=100.0)  # Percentage
    customer_rating = db.Column(db.Float, default=5.0)      # 1-5 scale
    jobs_completed = db.Column(db.Integer, default=0)
    total_revenue_generated = db.Column(db.Float, default=0.0)
    
    # Vehicle and equipment
    vehicle_assigned = db.Column(db.String(200))
    vehicle_license_plate = db.Column(db.String(20))
    equipment_assigned = db.Column(db.Text)  # JSON array of equipment
    
    # Emergency contact
    emergency_contact_name = db.Column(db.String(200))
    emergency_contact_phone = db.Column(db.String(20))
    emergency_contact_relationship = db.Column(db.String(100))
    
    # Notes and comments
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job_assignments = db.relationship('JobAssignment', backref='technician', lazy=True)
    time_entries = db.relationship('TimeEntry', backref='technician', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'user_id': self.user_id,
            'employee_id': self.employee_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'mobile_phone': self.mobile_phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'termination_date': self.termination_date.isoformat() if self.termination_date else None,
            'status': self.status.value if self.status else None,
            'skill_level': self.skill_level.value if self.skill_level else None,
            'specialties': json.loads(self.specialties) if self.specialties else [],
            'certifications': json.loads(self.certifications) if self.certifications else [],
            'licenses': json.loads(self.licenses) if self.licenses else [],
            'default_start_time': self.default_start_time.strftime('%H:%M') if self.default_start_time else None,
            'default_end_time': self.default_end_time.strftime('%H:%M') if self.default_end_time else None,
            'works_weekends': self.works_weekends,
            'available_for_emergency': self.available_for_emergency,
            'hourly_rate': self.hourly_rate,
            'overtime_rate': self.overtime_rate,
            'commission_rate': self.commission_rate,
            'efficiency_rating': self.efficiency_rating,
            'customer_rating': self.customer_rating,
            'jobs_completed': self.jobs_completed,
            'total_revenue_generated': self.total_revenue_generated,
            'vehicle_assigned': self.vehicle_assigned,
            'vehicle_license_plate': self.vehicle_license_plate,
            'equipment_assigned': json.loads(self.equipment_assigned) if self.equipment_assigned else [],
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_phone': self.emergency_contact_phone,
            'emergency_contact_relationship': self.emergency_contact_relationship,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class JobAssignment(db.Model):
    __tablename__ = 'job_assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    technician_id = db.Column(db.Integer, db.ForeignKey('technicians.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Assignment details
    assigned_date = db.Column(db.DateTime, default=datetime.utcnow)
    scheduled_start = db.Column(db.DateTime, nullable=False)
    scheduled_end = db.Column(db.DateTime, nullable=False)
    actual_start = db.Column(db.DateTime)
    actual_end = db.Column(db.DateTime)
    
    # Status and priority
    status = db.Column(db.Enum(ScheduleStatus), default=ScheduleStatus.SCHEDULED)
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    
    # Assignment details
    is_primary_technician = db.Column(db.Boolean, default=True)
    role_on_job = db.Column(db.String(100))  # lead, assistant, specialist, etc.
    estimated_hours = db.Column(db.Float)
    actual_hours = db.Column(db.Float)
    
    # Travel and location
    travel_time_to_job = db.Column(db.Float)  # Hours
    travel_time_from_job = db.Column(db.Float)  # Hours
    mileage = db.Column(db.Float)
    
    # Notes and updates
    assignment_notes = db.Column(db.Text)
    completion_notes = db.Column(db.Text)
    customer_feedback = db.Column(db.Text)
    
    # Assigned by
    assigned_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'technician_id': self.technician_id,
            'company_id': self.company_id,
            'assigned_date': self.assigned_date.isoformat() if self.assigned_date else None,
            'scheduled_start': self.scheduled_start.isoformat() if self.scheduled_start else None,
            'scheduled_end': self.scheduled_end.isoformat() if self.scheduled_end else None,
            'actual_start': self.actual_start.isoformat() if self.actual_start else None,
            'actual_end': self.actual_end.isoformat() if self.actual_end else None,
            'status': self.status.value if self.status else None,
            'priority': self.priority,
            'is_primary_technician': self.is_primary_technician,
            'role_on_job': self.role_on_job,
            'estimated_hours': self.estimated_hours,
            'actual_hours': self.actual_hours,
            'travel_time_to_job': self.travel_time_to_job,
            'travel_time_from_job': self.travel_time_from_job,
            'mileage': self.mileage,
            'assignment_notes': self.assignment_notes,
            'completion_notes': self.completion_notes,
            'customer_feedback': self.customer_feedback,
            'assigned_by_user_id': self.assigned_by_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class TimeEntry(db.Model):
    __tablename__ = 'time_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    technician_id = db.Column(db.Integer, db.ForeignKey('technicians.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=True)  # Null for non-job time
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Time tracking
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    total_hours = db.Column(db.Float)
    break_time_hours = db.Column(db.Float, default=0.0)
    billable_hours = db.Column(db.Float)
    
    # Time type
    time_type = db.Column(db.String(50), default='regular')  # regular, overtime, travel, training, admin
    is_billable = db.Column(db.Boolean, default=True)
    
    # Location tracking
    clock_in_location = db.Column(db.String(200))
    clock_out_location = db.Column(db.String(200))
    gps_coordinates_in = db.Column(db.String(100))  # lat,lng
    gps_coordinates_out = db.Column(db.String(100))  # lat,lng
    
    # Work description
    work_description = db.Column(db.Text)
    tasks_completed = db.Column(db.Text)  # JSON array of tasks
    materials_used = db.Column(db.Text)   # JSON array of materials
    
    # Approval workflow
    is_approved = db.Column(db.Boolean, default=False)
    approved_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_at = db.Column(db.DateTime)
    approval_notes = db.Column(db.Text)
    
    # Payroll integration
    is_processed_for_payroll = db.Column(db.Boolean, default=False)
    payroll_period = db.Column(db.String(50))
    
    # Notes
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'technician_id': self.technician_id,
            'job_id': self.job_id,
            'company_id': self.company_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'total_hours': self.total_hours,
            'break_time_hours': self.break_time_hours,
            'billable_hours': self.billable_hours,
            'time_type': self.time_type,
            'is_billable': self.is_billable,
            'clock_in_location': self.clock_in_location,
            'clock_out_location': self.clock_out_location,
            'gps_coordinates_in': self.gps_coordinates_in,
            'gps_coordinates_out': self.gps_coordinates_out,
            'work_description': self.work_description,
            'tasks_completed': json.loads(self.tasks_completed) if self.tasks_completed else [],
            'materials_used': json.loads(self.materials_used) if self.materials_used else [],
            'is_approved': self.is_approved,
            'approved_by_user_id': self.approved_by_user_id,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'approval_notes': self.approval_notes,
            'is_processed_for_payroll': self.is_processed_for_payroll,
            'payroll_period': self.payroll_period,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class TechnicianSchedule(db.Model):
    __tablename__ = 'technician_schedules'
    
    id = db.Column(db.Integer, primary_key=True)
    technician_id = db.Column(db.Integer, db.ForeignKey('technicians.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Schedule details
    schedule_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    
    # Schedule type
    schedule_type = db.Column(db.String(50), default='work')  # work, vacation, sick, training, etc.
    is_available = db.Column(db.Boolean, default=True)
    
    # Location
    work_location = db.Column(db.String(200))
    is_remote = db.Column(db.Boolean, default=False)
    
    # Notes
    notes = db.Column(db.Text)
    
    # Recurring schedule
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_pattern = db.Column(db.String(100))  # daily, weekly, monthly
    recurrence_end_date = db.Column(db.Date)
    
    # Created by
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'technician_id': self.technician_id,
            'company_id': self.company_id,
            'schedule_date': self.schedule_date.isoformat() if self.schedule_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'schedule_type': self.schedule_type,
            'is_available': self.is_available,
            'work_location': self.work_location,
            'is_remote': self.is_remote,
            'notes': self.notes,
            'is_recurring': self.is_recurring,
            'recurrence_pattern': self.recurrence_pattern,
            'recurrence_end_date': self.recurrence_end_date.isoformat() if self.recurrence_end_date else None,
            'created_by_user_id': self.created_by_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class MaterialRequest(db.Model):
    __tablename__ = 'material_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    technician_id = db.Column(db.Integer, db.ForeignKey('technicians.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Request details
    request_type = db.Column(db.String(50), default='material')  # material, tool, equipment
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    is_urgent = db.Column(db.Boolean, default=False)  # For urgent materials tab
    
    # Item details
    item_description = db.Column(db.Text, nullable=False)
    quantity_needed = db.Column(db.Float, nullable=False)
    unit_of_measure = db.Column(db.String(20), default='each')
    estimated_cost = db.Column(db.Float)
    
    # Inventory item reference (if exists)
    inventory_item_id = db.Column(db.Integer, db.ForeignKey('inventory_items.id'))
    
    # Request status
    status = db.Column(db.String(50), default='pending')  # pending, approved, ordered, received, cancelled
    
    # Justification and details
    reason_needed = db.Column(db.Text)
    job_impact = db.Column(db.Text)  # How this affects the job
    alternative_options = db.Column(db.Text)
    
    # Approval workflow
    requires_approval = db.Column(db.Boolean, default=True)
    approved_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    approved_at = db.Column(db.DateTime)
    approval_notes = db.Column(db.Text)
    
    # Fulfillment
    fulfilled_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    fulfilled_at = db.Column(db.DateTime)
    fulfillment_notes = db.Column(db.Text)
    actual_cost = db.Column(db.Float)
    
    # Delivery details
    delivery_location = db.Column(db.String(200))
    delivery_instructions = db.Column(db.Text)
    expected_delivery_date = db.Column(db.DateTime)
    actual_delivery_date = db.Column(db.DateTime)
    
    # Notes
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'technician_id': self.technician_id,
            'company_id': self.company_id,
            'request_type': self.request_type,
            'priority': self.priority,
            'is_urgent': self.is_urgent,
            'item_description': self.item_description,
            'quantity_needed': self.quantity_needed,
            'unit_of_measure': self.unit_of_measure,
            'estimated_cost': self.estimated_cost,
            'inventory_item_id': self.inventory_item_id,
            'status': self.status,
            'reason_needed': self.reason_needed,
            'job_impact': self.job_impact,
            'alternative_options': self.alternative_options,
            'requires_approval': self.requires_approval,
            'approved_by_user_id': self.approved_by_user_id,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'approval_notes': self.approval_notes,
            'fulfilled_by_user_id': self.fulfilled_by_user_id,
            'fulfilled_at': self.fulfilled_at.isoformat() if self.fulfilled_at else None,
            'fulfillment_notes': self.fulfillment_notes,
            'actual_cost': self.actual_cost,
            'delivery_location': self.delivery_location,
            'delivery_instructions': self.delivery_instructions,
            'expected_delivery_date': self.expected_delivery_date.isoformat() if self.expected_delivery_date else None,
            'actual_delivery_date': self.actual_delivery_date.isoformat() if self.actual_delivery_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

