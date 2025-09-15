from src.models.user import db
from datetime import datetime
import enum

class JobStatus(enum.Enum):
    SCHEDULED = 'scheduled'
    IN_PROGRESS = 'in_progress'
    ON_HOLD = 'on_hold'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    INVOICED = 'invoiced'

class JobPriority(enum.Enum):
    LOW = 'low'
    NORMAL = 'normal'
    HIGH = 'high'
    URGENT = 'urgent'

class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Job identification
    job_number = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    # Job details
    job_type = db.Column(db.String(50))  # service, installation, maintenance, repair
    category = db.Column(db.String(50))  # plumbing, electrical, hvac, etc.
    priority = db.Column(db.Enum(JobPriority), default=JobPriority.NORMAL)
    status = db.Column(db.Enum(JobStatus), default=JobStatus.SCHEDULED)
    
    # Scheduling
    scheduled_date = db.Column(db.DateTime)
    scheduled_start_time = db.Column(db.Time)
    scheduled_end_time = db.Column(db.Time)
    estimated_duration = db.Column(db.Integer)  # in minutes
    
    # Actual timing
    actual_start_time = db.Column(db.DateTime)
    actual_end_time = db.Column(db.DateTime)
    
    # Location
    service_address = db.Column(db.Text)
    service_city = db.Column(db.String(50))
    service_state = db.Column(db.String(20))
    service_zip = db.Column(db.String(10))
    
    # GPS coordinates for mapping
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Assignment
    assigned_technician_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    team_members = db.Column(db.Text)  # JSON array of user IDs
    
    # Scope of work
    scope_of_work = db.Column(db.Text)
    special_instructions = db.Column(db.Text)
    
    # Materials and tools
    materials_needed = db.Column(db.Text)  # JSON array of materials
    tools_needed = db.Column(db.Text)  # JSON array of tools
    urgent_materials = db.Column(db.Text)  # JSON array of urgent materials
    
    # Financial
    estimated_cost = db.Column(db.Float, default=0.0)
    actual_cost = db.Column(db.Float, default=0.0)
    labor_hours = db.Column(db.Float, default=0.0)
    labor_rate = db.Column(db.Float, default=75.0)
    
    # Customer communication
    customer_notified = db.Column(db.Boolean, default=False)
    customer_signature = db.Column(db.Text)  # Base64 encoded signature
    customer_feedback = db.Column(db.Text)
    customer_rating = db.Column(db.Integer)  # 1-5 stars
    
    # Photos and documentation
    before_photos = db.Column(db.Text)  # JSON array of photo URLs
    after_photos = db.Column(db.Text)  # JSON array of photo URLs
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Relationships
    assigned_technician = db.relationship('User', foreign_keys=[assigned_technician_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'customer_id': self.customer_id,
            'job_number': self.job_number,
            'title': self.title,
            'description': self.description,
            'job_type': self.job_type,
            'category': self.category,
            'priority': self.priority.value if self.priority else None,
            'status': self.status.value if self.status else None,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'scheduled_start_time': self.scheduled_start_time.isoformat() if self.scheduled_start_time else None,
            'scheduled_end_time': self.scheduled_end_time.isoformat() if self.scheduled_end_time else None,
            'estimated_duration': self.estimated_duration,
            'actual_start_time': self.actual_start_time.isoformat() if self.actual_start_time else None,
            'actual_end_time': self.actual_end_time.isoformat() if self.actual_end_time else None,
            'service_address': self.service_address,
            'service_city': self.service_city,
            'service_state': self.service_state,
            'service_zip': self.service_zip,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'assigned_technician_id': self.assigned_technician_id,
            'team_members': self.team_members,
            'scope_of_work': self.scope_of_work,
            'special_instructions': self.special_instructions,
            'materials_needed': self.materials_needed,
            'tools_needed': self.tools_needed,
            'urgent_materials': self.urgent_materials,
            'estimated_cost': self.estimated_cost,
            'actual_cost': self.actual_cost,
            'labor_hours': self.labor_hours,
            'labor_rate': self.labor_rate,
            'customer_notified': self.customer_notified,
            'customer_signature': self.customer_signature,
            'customer_feedback': self.customer_feedback,
            'customer_rating': self.customer_rating,
            'before_photos': self.before_photos,
            'after_photos': self.after_photos,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    @property
    def full_service_address(self):
        parts = [self.service_address, self.service_city, self.service_state, self.service_zip]
        return ', '.join([part for part in parts if part])

class JobNote(db.Model):
    __tablename__ = 'job_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Note details
    note_type = db.Column(db.String(50), default='general')  # general, technical, customer, internal
    title = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)
    
    # Visibility
    is_internal = db.Column(db.Boolean, default=False)
    is_customer_visible = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job = db.relationship('Job', backref='notes')
    user = db.relationship('User', backref='job_notes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'user_id': self.user_id,
            'note_type': self.note_type,
            'title': self.title,
            'content': self.content,
            'is_internal': self.is_internal,
            'is_customer_visible': self.is_customer_visible,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class JobTimeEntry(db.Model):
    __tablename__ = 'job_time_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Time tracking
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    duration_minutes = db.Column(db.Integer)
    
    # Work details
    work_description = db.Column(db.Text)
    billable = db.Column(db.Boolean, default=True)
    hourly_rate = db.Column(db.Float)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job = db.relationship('Job', backref='time_entries')
    user = db.relationship('User', backref='time_entries')
    
    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'user_id': self.user_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_minutes': self.duration_minutes,
            'work_description': self.work_description,
            'billable': self.billable,
            'hourly_rate': self.hourly_rate,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

