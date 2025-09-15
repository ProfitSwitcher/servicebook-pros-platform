"""
Communication API routes for ServiceBook Pros
Handles SMS, Email, templates, and notifications
"""

from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.communication import (
    MessageTemplate, CommunicationLog, CustomerQuestion, 
    NotificationSettings, AutomatedMessage,
    CommunicationType, CommunicationStatus, CommunicationPriority
)
from src.models.customer import Customer
from src.models.job import Job
from src.models.technician import Technician
from datetime import datetime, timedelta
import json

communication_bp = Blueprint('communication', __name__)

# Message Templates
@communication_bp.route('/templates', methods=['GET'])
def get_templates():
    """Get all message templates for a company"""
    try:
        company_id = request.args.get('company_id', 1)
        category = request.args.get('category')
        communication_type = request.args.get('type')
        
        query = MessageTemplate.query.filter_by(company_id=company_id)
        
        if category:
            query = query.filter_by(category=category)
        if communication_type:
            query = query.filter_by(communication_type=CommunicationType(communication_type))
            
        templates = query.all()
        
        return jsonify({
            'success': True,
            'templates': [template.to_dict() for template in templates]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/templates', methods=['POST'])
def create_template():
    """Create a new message template"""
    try:
        data = request.get_json()
        
        template = MessageTemplate(
            company_id=data.get('company_id', 1),
            name=data['name'],
            description=data.get('description'),
            category=data.get('category'),
            communication_type=CommunicationType(data['communication_type']),
            subject=data.get('subject'),
            message_body=data['message_body'],
            available_variables=json.dumps(data.get('available_variables', [])),
            send_timing=data.get('send_timing', 'immediate'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(template)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'template': template.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/templates/<int:template_id>', methods=['PUT'])
def update_template(template_id):
    """Update a message template"""
    try:
        template = MessageTemplate.query.get_or_404(template_id)
        data = request.get_json()
        
        template.name = data.get('name', template.name)
        template.description = data.get('description', template.description)
        template.category = data.get('category', template.category)
        template.subject = data.get('subject', template.subject)
        template.message_body = data.get('message_body', template.message_body)
        template.is_active = data.get('is_active', template.is_active)
        template.updated_at = datetime.utcnow()
        
        if 'available_variables' in data:
            template.available_variables = json.dumps(data['available_variables'])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'template': template.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Communication Logs
@communication_bp.route('/logs', methods=['GET'])
def get_communication_logs():
    """Get communication logs with filtering"""
    try:
        company_id = request.args.get('company_id', 1)
        customer_id = request.args.get('customer_id')
        job_id = request.args.get('job_id')
        communication_type = request.args.get('type')
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        
        query = CommunicationLog.query.filter_by(company_id=company_id)
        
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
        if job_id:
            query = query.filter_by(job_id=job_id)
        if communication_type:
            query = query.filter_by(communication_type=CommunicationType(communication_type))
        if status:
            query = query.filter_by(status=CommunicationStatus(status))
            
        logs = query.order_by(CommunicationLog.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'success': True,
            'logs': [log.to_dict() for log in logs],
            'total': query.count()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/send', methods=['POST'])
def send_message():
    """Send a message (SMS or Email)"""
    try:
        data = request.get_json()
        
        # Create communication log entry
        comm_log = CommunicationLog(
            company_id=data.get('company_id', 1),
            customer_id=data.get('customer_id'),
            technician_id=data.get('technician_id'),
            communication_type=CommunicationType(data['communication_type']),
            recipient_phone=data.get('recipient_phone'),
            recipient_email=data.get('recipient_email'),
            recipient_name=data.get('recipient_name'),
            subject=data.get('subject'),
            message_body=data['message_body'],
            priority=CommunicationPriority(data.get('priority', 'normal')),
            job_id=data.get('job_id'),
            template_id=data.get('template_id'),
            sent_by_user_id=data.get('sent_by_user_id'),
            scheduled_send_time=datetime.utcnow() if data.get('send_immediately', True) else None
        )
        
        # In a real implementation, this would integrate with Twilio/SendGrid
        # For demo purposes, we'll mark as sent immediately
        comm_log.status = CommunicationStatus.SENT
        comm_log.sent_at = datetime.utcnow()
        comm_log.external_message_id = f"demo_{datetime.utcnow().timestamp()}"
        
        db.session.add(comm_log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Message sent successfully',
            'communication_log': comm_log.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Customer Questions
@communication_bp.route('/questions', methods=['GET'])
def get_customer_questions():
    """Get customer questions with filtering"""
    try:
        company_id = request.args.get('company_id', 1)
        job_id = request.args.get('job_id')
        customer_id = request.args.get('customer_id')
        is_urgent = request.args.get('is_urgent')
        status = request.args.get('status')
        
        query = CustomerQuestion.query.filter_by(company_id=company_id)
        
        if job_id:
            query = query.filter_by(job_id=job_id)
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
        if is_urgent is not None:
            query = query.filter_by(is_urgent=is_urgent.lower() == 'true')
        if status:
            query = query.filter_by(status=status)
            
        questions = query.order_by(CustomerQuestion.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'questions': [question.to_dict() for question in questions]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/questions', methods=['POST'])
def create_customer_question():
    """Create a new customer question"""
    try:
        data = request.get_json()
        
        question = CustomerQuestion(
            company_id=data.get('company_id', 1),
            job_id=data['job_id'],
            customer_id=data['customer_id'],
            question_text=data['question_text'],
            question_type=data.get('question_type', 'general'),
            category=data.get('category'),
            is_urgent=data.get('is_urgent', False),
            priority=CommunicationPriority(data.get('priority', 'normal')),
            asked_by_user_id=data.get('asked_by_user_id'),
            technician_id=data.get('technician_id')
        )
        
        db.session.add(question)
        db.session.commit()
        
        # If urgent, could trigger immediate notification here
        if question.is_urgent:
            # In real implementation, send immediate SMS/email
            pass
        
        return jsonify({
            'success': True,
            'question': question.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/questions/<int:question_id>/answer', methods=['POST'])
def answer_customer_question(question_id):
    """Answer a customer question"""
    try:
        question = CustomerQuestion.query.get_or_404(question_id)
        data = request.get_json()
        
        question.answer_text = data['answer_text']
        question.answered_by_customer = True
        question.answered_at = datetime.utcnow()
        question.status = 'answered'
        question.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'question': question.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Notification Settings
@communication_bp.route('/settings', methods=['GET'])
def get_notification_settings():
    """Get notification settings for a company"""
    try:
        company_id = request.args.get('company_id', 1)
        
        settings = NotificationSettings.query.filter_by(company_id=company_id).first()
        
        if not settings:
            # Create default settings
            settings = NotificationSettings(company_id=company_id)
            db.session.add(settings)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'settings': settings.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/settings', methods=['POST'])
def update_notification_settings():
    """Update notification settings"""
    try:
        data = request.get_json()
        company_id = data.get('company_id', 1)
        
        settings = NotificationSettings.query.filter_by(company_id=company_id).first()
        
        if not settings:
            settings = NotificationSettings(company_id=company_id)
            db.session.add(settings)
        
        # Update settings
        settings.sms_enabled = data.get('sms_enabled', settings.sms_enabled)
        settings.email_enabled = data.get('email_enabled', settings.email_enabled)
        settings.twilio_account_sid = data.get('twilio_account_sid', settings.twilio_account_sid)
        settings.twilio_phone_number = data.get('twilio_phone_number', settings.twilio_phone_number)
        settings.sendgrid_api_key = data.get('sendgrid_api_key', settings.sendgrid_api_key)
        settings.from_email = data.get('from_email', settings.from_email)
        settings.from_name = data.get('from_name', settings.from_name)
        settings.send_appointment_reminders = data.get('send_appointment_reminders', settings.send_appointment_reminders)
        settings.send_job_updates = data.get('send_job_updates', settings.send_job_updates)
        settings.send_completion_notifications = data.get('send_completion_notifications', settings.send_completion_notifications)
        settings.send_invoice_notifications = data.get('send_invoice_notifications', settings.send_invoice_notifications)
        settings.reminder_hours_before = data.get('reminder_hours_before', settings.reminder_hours_before)
        settings.updated_at = datetime.utcnow()
        
        # Handle sensitive data (in real implementation, encrypt these)
        if 'twilio_auth_token' in data:
            settings.twilio_auth_token = data['twilio_auth_token']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'settings': settings.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Analytics
@communication_bp.route('/analytics', methods=['GET'])
def get_communication_analytics():
    """Get communication analytics"""
    try:
        company_id = request.args.get('company_id', 1)
        days = int(request.args.get('days', 30))
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Total messages sent
        total_messages = CommunicationLog.query.filter(
            CommunicationLog.company_id == company_id,
            CommunicationLog.created_at >= start_date
        ).count()
        
        # Messages by type
        sms_count = CommunicationLog.query.filter(
            CommunicationLog.company_id == company_id,
            CommunicationLog.communication_type == CommunicationType.SMS,
            CommunicationLog.created_at >= start_date
        ).count()
        
        email_count = CommunicationLog.query.filter(
            CommunicationLog.company_id == company_id,
            CommunicationLog.communication_type == CommunicationType.EMAIL,
            CommunicationLog.created_at >= start_date
        ).count()
        
        # Success rate
        successful_messages = CommunicationLog.query.filter(
            CommunicationLog.company_id == company_id,
            CommunicationLog.status.in_([CommunicationStatus.SENT, CommunicationStatus.DELIVERED]),
            CommunicationLog.created_at >= start_date
        ).count()
        
        success_rate = (successful_messages / total_messages * 100) if total_messages > 0 else 0
        
        # Pending questions
        pending_questions = CustomerQuestion.query.filter(
            CustomerQuestion.company_id == company_id,
            CustomerQuestion.status == 'pending'
        ).count()
        
        urgent_questions = CustomerQuestion.query.filter(
            CustomerQuestion.company_id == company_id,
            CustomerQuestion.is_urgent == True,
            CustomerQuestion.status == 'pending'
        ).count()
        
        return jsonify({
            'success': True,
            'analytics': {
                'total_messages': total_messages,
                'sms_count': sms_count,
                'email_count': email_count,
                'success_rate': round(success_rate, 2),
                'pending_questions': pending_questions,
                'urgent_questions': urgent_questions,
                'period_days': days
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Automated Messages
@communication_bp.route('/automated', methods=['GET'])
def get_automated_messages():
    """Get automated message rules"""
    try:
        company_id = request.args.get('company_id', 1)
        
        automated_messages = AutomatedMessage.query.filter_by(company_id=company_id).all()
        
        return jsonify({
            'success': True,
            'automated_messages': [msg.to_dict() for msg in automated_messages]
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/automated', methods=['POST'])
def create_automated_message():
    """Create automated message rule"""
    try:
        data = request.get_json()
        
        automated_msg = AutomatedMessage(
            company_id=data.get('company_id', 1),
            trigger_event=data['trigger_event'],
            trigger_conditions=json.dumps(data.get('trigger_conditions', {})),
            template_id=data['template_id'],
            delay_minutes=data.get('delay_minutes', 0),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(automated_msg)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'automated_message': automated_msg.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

