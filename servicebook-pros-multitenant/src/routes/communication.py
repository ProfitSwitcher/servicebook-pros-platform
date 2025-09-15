from flask import Blueprint, request, jsonify
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, desc
from src.models.message import Message, Customer
from src.models.company import Company
from src.utils.communication import CommunicationService
from datetime import datetime
import logging

# Create blueprint
communication_bp = Blueprint('communication', __name__)

# Database setup
DATABASE_URL = "sqlite:///servicebook_pros.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

logger = logging.getLogger(__name__)

@communication_bp.route('/api/messages', methods=['GET'])
def get_messages():
    """Get all messages for a company"""
    try:
        company_id = request.args.get('company_id', 1)  # Default to company 1
        customer_id = request.args.get('customer_id')
        message_type = request.args.get('type')  # 'sms' or 'email'
        limit = int(request.args.get('limit', 50))
        
        db = SessionLocal()
        
        query = db.query(Message).filter(Message.company_id == company_id)
        
        if customer_id:
            query = query.filter(Message.customer_id == customer_id)
        
        if message_type:
            query = query.filter(Message.message_type == message_type)
        
        messages = query.order_by(desc(Message.created_at)).limit(limit).all()
        
        db.close()
        
        return jsonify({
            'success': True,
            'messages': [message.to_dict() for message in messages]
        })
        
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/api/messages/send', methods=['POST'])
def send_message():
    """Send SMS or email message"""
    try:
        data = request.get_json()
        
        company_id = data.get('company_id', 1)
        customer_id = data.get('customer_id')
        message_type = data.get('type')  # 'sms' or 'email'
        content = data.get('content')
        subject = data.get('subject')  # For emails
        to_phone = data.get('to_phone')
        to_email = data.get('to_email')
        customer_name = data.get('customer_name')
        template_type = data.get('template_type')
        template_data = data.get('template_data', {})
        
        if not content and not template_type:
            return jsonify({'success': False, 'error': 'Content or template_type required'}), 400
        
        db = SessionLocal()
        
        # Create message record
        message = Message(
            company_id=company_id,
            customer_id=customer_id,
            customer_name=customer_name,
            customer_phone=to_phone,
            customer_email=to_email,
            message_type=message_type,
            direction='outbound',
            subject=subject,
            content=content
        )
        
        if message_type == 'sms':
            if not to_phone:
                return jsonify({'success': False, 'error': 'Phone number required for SMS'}), 400
            
            # Use template if specified
            if template_type:
                content = CommunicationService.create_sms_template(template_type, **template_data)
                message.content = content
            
            # Send SMS
            result = CommunicationService.send_sms(to_phone, content)
            
            if result['success']:
                message.twilio_sid = result['message_sid']
                message.status = result['status']
            else:
                message.status = 'failed'
                
        elif message_type == 'email':
            if not to_email:
                return jsonify({'success': False, 'error': 'Email address required for email'}), 400
            
            # Use template if specified
            if template_type:
                email_subject, email_content = CommunicationService.create_email_template(
                    template_type, 
                    customer_name=customer_name,
                    **template_data
                )
                message.subject = email_subject
                message.content = email_content
                content = email_content
                subject = email_subject
            
            # Send email
            result = CommunicationService.send_email(to_email, subject, content)
            
            if result['success']:
                message.sendgrid_message_id = result['message_id']
                message.status = 'sent'
            else:
                message.status = 'failed'
        
        else:
            return jsonify({'success': False, 'error': 'Invalid message type'}), 400
        
        # Save message to database
        db.add(message)
        db.commit()
        
        db.close()
        
        return jsonify({
            'success': result['success'],
            'message': message.to_dict(),
            'error': result.get('error')
        })
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/api/webhooks/twilio', methods=['POST'])
def twilio_webhook():
    """Handle incoming SMS from Twilio"""
    try:
        # Get Twilio webhook data
        message_sid = request.form.get('MessageSid')
        from_phone = request.form.get('From')
        to_phone = request.form.get('To')
        body = request.form.get('Body')
        
        logger.info(f"Received SMS from {from_phone}: {body}")
        
        db = SessionLocal()
        
        # Try to find existing customer by phone
        customer = db.query(Customer).filter(
            Customer.phone.like(f"%{from_phone[-10:]}%")
        ).first()
        
        # Create message record
        message = Message(
            company_id=1,  # Default company
            customer_id=customer.id if customer else None,
            customer_name=customer.name if customer else None,
            customer_phone=from_phone,
            message_type='sms',
            direction='inbound',
            content=body,
            twilio_sid=message_sid,
            status='received'
        )
        
        db.add(message)
        db.commit()
        
        # Handle opt-out requests
        if body.upper().strip() in ['STOP', 'UNSUBSCRIBE', 'QUIT']:
            if customer:
                customer.opt_out_sms = True
                db.commit()
            
            # Send confirmation
            CommunicationService.send_sms(
                from_phone, 
                "You have been unsubscribed from SMS notifications. Reply START to resubscribe."
            )
        
        # Handle opt-in requests
        elif body.upper().strip() == 'START':
            if customer:
                customer.opt_out_sms = False
                db.commit()
            
            # Send confirmation
            CommunicationService.send_sms(
                from_phone, 
                "You have been resubscribed to SMS notifications. Reply STOP to unsubscribe."
            )
        
        db.close()
        
        return '', 200
        
    except Exception as e:
        logger.error(f"Error processing Twilio webhook: {str(e)}")
        return '', 500

@communication_bp.route('/api/webhooks/sendgrid', methods=['POST'])
def sendgrid_webhook():
    """Handle email events from SendGrid"""
    try:
        events = request.get_json()
        
        db = SessionLocal()
        
        for event in events:
            message_id = event.get('sg_message_id')
            event_type = event.get('event')
            
            # Find message by SendGrid message ID
            message = db.query(Message).filter(
                Message.sendgrid_message_id == message_id
            ).first()
            
            if message:
                # Update message status based on event
                if event_type == 'delivered':
                    message.status = 'delivered'
                elif event_type == 'bounce':
                    message.status = 'failed'
                elif event_type == 'open':
                    message.read = True
                
                message.updated_at = datetime.utcnow()
        
        db.commit()
        db.close()
        
        return '', 200
        
    except Exception as e:
        logger.error(f"Error processing SendGrid webhook: {str(e)}")
        return '', 500

@communication_bp.route('/api/customers', methods=['GET'])
def get_customers():
    """Get all customers for a company"""
    try:
        company_id = request.args.get('company_id', 1)
        search = request.args.get('search', '')
        
        db = SessionLocal()
        
        query = db.query(Customer).filter(Customer.company_id == company_id)
        
        if search:
            query = query.filter(
                Customer.name.ilike(f'%{search}%') |
                Customer.email.ilike(f'%{search}%') |
                Customer.phone.ilike(f'%{search}%')
            )
        
        customers = query.order_by(Customer.name).all()
        
        db.close()
        
        return jsonify({
            'success': True,
            'customers': [customer.to_dict() for customer in customers]
        })
        
    except Exception as e:
        logger.error(f"Error fetching customers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/api/customers', methods=['POST'])
def create_customer():
    """Create a new customer"""
    try:
        data = request.get_json()
        
        db = SessionLocal()
        
        customer = Customer(
            company_id=data.get('company_id', 1),
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address'),
            city=data.get('city'),
            state=data.get('state'),
            zip_code=data.get('zip_code'),
            preferred_contact=data.get('preferred_contact', 'phone')
        )
        
        db.add(customer)
        db.commit()
        
        result = customer.to_dict()
        
        db.close()
        
        return jsonify({
            'success': True,
            'customer': result
        })
        
    except Exception as e:
        logger.error(f"Error creating customer: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/api/conversations', methods=['GET'])
def get_conversations():
    """Get conversation threads grouped by customer"""
    try:
        company_id = request.args.get('company_id', 1)
        
        db = SessionLocal()
        
        # Get latest message for each customer/phone/email combination
        conversations = db.query(Message).filter(
            Message.company_id == company_id
        ).order_by(desc(Message.created_at)).all()
        
        # Group by customer
        grouped = {}
        for message in conversations:
            key = message.customer_id or message.customer_phone or message.customer_email
            if key not in grouped:
                grouped[key] = {
                    'customer_id': message.customer_id,
                    'customer_name': message.customer_name,
                    'customer_phone': message.customer_phone,
                    'customer_email': message.customer_email,
                    'last_message': message.to_dict(),
                    'unread_count': 0,
                    'messages': []
                }
            
            grouped[key]['messages'].append(message.to_dict())
            if not message.read and message.direction == 'inbound':
                grouped[key]['unread_count'] += 1
        
        # Sort by last message time
        conversations_list = list(grouped.values())
        conversations_list.sort(
            key=lambda x: x['last_message']['created_at'], 
            reverse=True
        )
        
        db.close()
        
        return jsonify({
            'success': True,
            'conversations': conversations_list
        })
        
    except Exception as e:
        logger.error(f"Error fetching conversations: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_bp.route('/api/messages/<int:message_id>/read', methods=['PUT'])
def mark_message_read():
    """Mark a message as read"""
    try:
        message_id = request.view_args['message_id']
        
        db = SessionLocal()
        
        message = db.query(Message).filter(Message.id == message_id).first()
        
        if not message:
            return jsonify({'success': False, 'error': 'Message not found'}), 404
        
        message.read = True
        message.updated_at = datetime.utcnow()
        
        db.commit()
        db.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Error marking message as read: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

