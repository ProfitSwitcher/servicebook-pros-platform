from flask import Blueprint, request, jsonify
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from src.models.communication_config import CommunicationConfig, PhoneNumberPool, EmailDomain
from src.models.company import Company
from src.utils.communication import CommunicationService
from datetime import datetime
import logging
import os

# Create blueprint
communication_setup_bp = Blueprint('communication_setup', __name__)

# Database setup
DATABASE_URL = "sqlite:///servicebook_pros.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

logger = logging.getLogger(__name__)

@communication_setup_bp.route('/api/communication/config', methods=['GET'])
def get_communication_config():
    """Get communication configuration for a company"""
    try:
        company_id = request.args.get('company_id', 1)
        
        db = SessionLocal()
        
        config = db.query(CommunicationConfig).filter(
            CommunicationConfig.company_id == company_id
        ).first()
        
        if not config:
            # Create default config
            config = CommunicationConfig(
                company_id=company_id,
                auto_reply_message="Thank you for contacting us! We'll get back to you soon.",
                appointment_reminder_template="Hi {customer_name}, this is a reminder that your appointment is scheduled for {appointment_time}.",
                estimate_ready_template="Hi {customer_name}, your estimate is ready! Total: ${amount}. Please let us know if you'd like to proceed.",
                job_completion_template="Hi {customer_name}, your service has been completed. Thank you for choosing us!",
                payment_reminder_template="Hi {customer_name}, this is a friendly reminder that your invoice #{invoice_number} is due."
            )
            db.add(config)
            db.commit()
        
        result = config.to_dict()
        
        db.close()
        
        return jsonify({
            'success': True,
            'config': result
        })
        
    except Exception as e:
        logger.error(f"Error fetching communication config: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_setup_bp.route('/api/communication/config', methods=['PUT'])
def update_communication_config():
    """Update communication configuration for a company"""
    try:
        data = request.get_json()
        company_id = data.get('company_id', 1)
        
        db = SessionLocal()
        
        config = db.query(CommunicationConfig).filter(
            CommunicationConfig.company_id == company_id
        ).first()
        
        if not config:
            config = CommunicationConfig(company_id=company_id)
            db.add(config)
        
        # Update configuration
        if 'twilio_account_sid' in data:
            config.twilio_account_sid = data['twilio_account_sid']
        if 'twilio_auth_token' in data:
            config.twilio_auth_token = data['twilio_auth_token']
        if 'twilio_phone_number' in data:
            config.twilio_phone_number = data['twilio_phone_number']
        if 'sendgrid_api_key' in data:
            config.sendgrid_api_key = data['sendgrid_api_key']
        if 'sendgrid_from_email' in data:
            config.sendgrid_from_email = data['sendgrid_from_email']
        if 'sendgrid_from_name' in data:
            config.sendgrid_from_name = data['sendgrid_from_name']
        if 'custom_domain' in data:
            config.custom_domain = data['custom_domain']
        if 'auto_reply_enabled' in data:
            config.auto_reply_enabled = data['auto_reply_enabled']
        if 'auto_reply_message' in data:
            config.auto_reply_message = data['auto_reply_message']
        if 'business_hours_only' in data:
            config.business_hours_only = data['business_hours_only']
        if 'business_hours_start' in data:
            config.business_hours_start = data['business_hours_start']
        if 'business_hours_end' in data:
            config.business_hours_end = data['business_hours_end']
        
        # Update templates
        if 'appointment_reminder_template' in data:
            config.appointment_reminder_template = data['appointment_reminder_template']
        if 'estimate_ready_template' in data:
            config.estimate_ready_template = data['estimate_ready_template']
        if 'job_completion_template' in data:
            config.job_completion_template = data['job_completion_template']
        if 'payment_reminder_template' in data:
            config.payment_reminder_template = data['payment_reminder_template']
        
        config.updated_at = datetime.utcnow()
        
        db.commit()
        
        result = config.to_dict()
        
        db.close()
        
        return jsonify({
            'success': True,
            'config': result
        })
        
    except Exception as e:
        logger.error(f"Error updating communication config: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_setup_bp.route('/api/communication/phone-numbers/available', methods=['GET'])
def get_available_phone_numbers():
    """Get available phone numbers for purchase"""
    try:
        area_code = request.args.get('area_code')
        country = request.args.get('country', 'US')
        
        # In a real implementation, this would call Twilio API to search for available numbers
        # For demo purposes, we'll return some sample numbers
        
        sample_numbers = [
            {
                'phone_number': '+1406555-0101',
                'area_code': '406',
                'region': 'Montana',
                'monthly_cost': '1.00',
                'capabilities': ['SMS', 'Voice'],
                'available': True
            },
            {
                'phone_number': '+1406555-0102',
                'area_code': '406',
                'region': 'Montana',
                'monthly_cost': '1.00',
                'capabilities': ['SMS', 'Voice'],
                'available': True
            },
            {
                'phone_number': '+1719555-0201',
                'area_code': '719',
                'region': 'Colorado',
                'monthly_cost': '1.00',
                'capabilities': ['SMS', 'Voice'],
                'available': True
            }
        ]
        
        # Filter by area code if provided
        if area_code:
            sample_numbers = [num for num in sample_numbers if num['area_code'] == area_code]
        
        return jsonify({
            'success': True,
            'phone_numbers': sample_numbers
        })
        
    except Exception as e:
        logger.error(f"Error fetching available phone numbers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_setup_bp.route('/api/communication/phone-numbers/purchase', methods=['POST'])
def purchase_phone_number():
    """Purchase a phone number for a company"""
    try:
        data = request.get_json()
        company_id = data.get('company_id')
        phone_number = data.get('phone_number')
        
        if not company_id or not phone_number:
            return jsonify({'success': False, 'error': 'Company ID and phone number required'}), 400
        
        db = SessionLocal()
        
        # In a real implementation, this would:
        # 1. Call Twilio API to purchase the number
        # 2. Set up webhook URLs
        # 3. Update the company's communication config
        
        # Update communication config with new phone number
        config = db.query(CommunicationConfig).filter(
            CommunicationConfig.company_id == company_id
        ).first()
        
        if not config:
            config = CommunicationConfig(company_id=company_id)
            db.add(config)
        
        config.twilio_phone_number = phone_number
        config.twilio_webhook_url = f"{os.getenv('BASE_URL', 'https://your-domain.com')}/api/webhooks/twilio/{company_id}"
        config.updated_at = datetime.utcnow()
        
        db.commit()
        
        result = config.to_dict()
        
        db.close()
        
        return jsonify({
            'success': True,
            'message': f'Phone number {phone_number} purchased successfully',
            'config': result
        })
        
    except Exception as e:
        logger.error(f"Error purchasing phone number: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_setup_bp.route('/api/communication/email-domain', methods=['POST'])
def setup_email_domain():
    """Set up custom email domain for a company"""
    try:
        data = request.get_json()
        company_id = data.get('company_id')
        domain_name = data.get('domain_name')
        
        if not company_id or not domain_name:
            return jsonify({'success': False, 'error': 'Company ID and domain name required'}), 400
        
        db = SessionLocal()
        
        # Check if domain already exists
        existing_domain = db.query(EmailDomain).filter(
            EmailDomain.company_id == company_id,
            EmailDomain.domain_name == domain_name
        ).first()
        
        if existing_domain:
            return jsonify({'success': False, 'error': 'Domain already configured'}), 400
        
        # Create new email domain
        email_domain = EmailDomain(
            company_id=company_id,
            domain_name=domain_name,
            verification_token=f"servicebook-{company_id}-{datetime.utcnow().timestamp()}",
            spf_record="v=spf1 include:sendgrid.net ~all",
            dkim_record="Generated by SendGrid - see SendGrid dashboard",
            dmarc_record="v=DMARC1; p=none; rua=mailto:dmarc@" + domain_name
        )
        
        db.add(email_domain)
        
        # Update communication config
        config = db.query(CommunicationConfig).filter(
            CommunicationConfig.company_id == company_id
        ).first()
        
        if not config:
            config = CommunicationConfig(company_id=company_id)
            db.add(config)
        
        config.custom_domain = domain_name
        config.sendgrid_from_email = f"noreply@{domain_name}"
        config.sendgrid_webhook_url = f"{os.getenv('BASE_URL', 'https://your-domain.com')}/api/webhooks/sendgrid/{company_id}"
        config.updated_at = datetime.utcnow()
        
        db.commit()
        
        domain_result = email_domain.to_dict()
        config_result = config.to_dict()
        
        db.close()
        
        return jsonify({
            'success': True,
            'message': f'Email domain {domain_name} configured successfully',
            'domain': domain_result,
            'config': config_result,
            'dns_records': {
                'spf': email_domain.spf_record,
                'dkim': email_domain.dkim_record,
                'dmarc': email_domain.dmarc_record,
                'verification_txt': f"servicebook-verification={email_domain.verification_token}"
            }
        })
        
    except Exception as e:
        logger.error(f"Error setting up email domain: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_setup_bp.route('/api/communication/email-domain/verify', methods=['POST'])
def verify_email_domain():
    """Verify email domain ownership"""
    try:
        data = request.get_json()
        company_id = data.get('company_id')
        domain_name = data.get('domain_name')
        
        db = SessionLocal()
        
        email_domain = db.query(EmailDomain).filter(
            EmailDomain.company_id == company_id,
            EmailDomain.domain_name == domain_name
        ).first()
        
        if not email_domain:
            return jsonify({'success': False, 'error': 'Domain not found'}), 404
        
        # In a real implementation, this would:
        # 1. Check DNS records for verification
        # 2. Call SendGrid API to verify domain
        # 3. Update verification status
        
        # For demo purposes, we'll mark as verified
        email_domain.is_verified = True
        email_domain.sendgrid_status = 'verified'
        email_domain.updated_at = datetime.utcnow()
        
        # Update communication config
        config = db.query(CommunicationConfig).filter(
            CommunicationConfig.company_id == company_id
        ).first()
        
        if config:
            config.domain_verified = True
            config.updated_at = datetime.utcnow()
        
        db.commit()
        
        result = email_domain.to_dict()
        
        db.close()
        
        return jsonify({
            'success': True,
            'message': f'Domain {domain_name} verified successfully',
            'domain': result
        })
        
    except Exception as e:
        logger.error(f"Error verifying email domain: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@communication_setup_bp.route('/api/communication/test', methods=['POST'])
def test_communication():
    """Test SMS and email configuration"""
    try:
        data = request.get_json()
        company_id = data.get('company_id')
        test_type = data.get('type')  # 'sms' or 'email'
        test_recipient = data.get('recipient')
        
        if not all([company_id, test_type, test_recipient]):
            return jsonify({'success': False, 'error': 'Missing required parameters'}), 400
        
        db = SessionLocal()
        
        config = db.query(CommunicationConfig).filter(
            CommunicationConfig.company_id == company_id
        ).first()
        
        if not config:
            return jsonify({'success': False, 'error': 'Communication not configured'}), 400
        
        if test_type == 'sms':
            if not config.twilio_phone_number:
                return jsonify({'success': False, 'error': 'SMS not configured'}), 400
            
            # Send test SMS
            result = CommunicationService.send_sms(
                test_recipient,
                "This is a test message from ServiceBook Pros. Your SMS configuration is working!"
            )
            
        elif test_type == 'email':
            if not config.sendgrid_from_email:
                return jsonify({'success': False, 'error': 'Email not configured'}), 400
            
            # Send test email
            result = CommunicationService.send_email(
                test_recipient,
                "ServiceBook Pros - Test Email",
                "This is a test email from ServiceBook Pros. Your email configuration is working!"
            )
            
        else:
            return jsonify({'success': False, 'error': 'Invalid test type'}), 400
        
        db.close()
        
        return jsonify({
            'success': result['success'],
            'message': f'Test {test_type} sent successfully' if result['success'] else f'Test {test_type} failed',
            'details': result
        })
        
    except Exception as e:
        logger.error(f"Error testing communication: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

