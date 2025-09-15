import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp

# Create Flask app
app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app, origins=['*'], allow_headers=['*'], methods=['*'], supports_credentials=True)

# Import routes
from src.routes.auth import auth_bp
from src.routes.customers import customers_bp
from src.routes.jobs import jobs_bp
from src.routes.estimates import estimates_bp
from src.routes.invoices import invoices_bp
from src.routes.analytics import analytics_bp
from src.routes.settings import settings_bp
from src.routes.pricing import pricing_bp
from src.routes.inventory import inventory_bp
from src.routes.technicians import technicians_bp
from src.routes.communication import communication_bp
from src.routes.business_intelligence import business_intelligence_bp
from src.routes.ai_features import ai_features_bp

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api/users')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(customers_bp, url_prefix='/api/customers')
app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
app.register_blueprint(estimates_bp, url_prefix='/api/estimates')
app.register_blueprint(invoices_bp, url_prefix='/api/invoices')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(pricing_bp, url_prefix='/api/pricing')
app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
app.register_blueprint(technicians_bp, url_prefix='/api/technicians')
app.register_blueprint(communication_bp, url_prefix='/api/communication')
app.register_blueprint(business_intelligence_bp, url_prefix='/api/bi')
app.register_blueprint(ai_features_bp, url_prefix='/api/ai')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'servicebook-pros-secret-key-2024'
db.init_app(app)

# Import all models to ensure they're created
from src.models.customer import Customer
from src.models.job import Job, JobStatus
from src.models.estimate import Estimate
from src.models.invoice import Invoice
from src.models.company import Company
from src.models.pricing import FlatRatePricingItem, PricingTemplate, CompanyPricingSettings
from src.models.inventory import InventoryItem, StockMovement
from src.models.technician import Technician, TechnicianSchedule
from src.models.communication import MessageTemplate, CommunicationLog, CustomerQuestion, NotificationSettings, AutomatedMessage
from src.models.business_intelligence import BusinessMetric, CustomReport, RevenueAnalytics, CustomerAnalytics, TechnicianPerformance, PredictiveInsight
from src.models.ai_features import AIJobRecommendation, PredictiveMaintenance, AIInsight, SmartAutomation, CustomerBehaviorAnalysis, AIPerformanceMetrics

with app.app_context():
    db.create_all()
    
    # Initialize demo data
    try:
        from src.utils.init_enhanced_demo_data import init_enhanced_demo_data
        init_enhanced_demo_data()
    except Exception as e:
        print(f"Warning: Could not initialize enhanced demo data: {e}")
        # Fallback to original demo data
        try:
            from src.utils.init_demo_data import init_demo_data
            init_demo_data()
        except Exception as e2:
            print(f"Warning: Could not initialize demo data: {e2}")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy', 
        'service': 'ServiceBook Pros API',
        'version': '1.0.0'
    }), 200

# API documentation endpoint
@app.route('/api/docs')
def api_docs():
    return jsonify({
        'service': 'ServiceBook Pros API',
        'version': '2.0.0',
        'endpoints': {
            'auth': '/api/auth/*',
            'customers': '/api/customers/*',
            'jobs': '/api/jobs/*',
            'estimates': '/api/estimates/*',
            'invoices': '/api/invoices/*',
            'analytics': '/api/analytics/*',
            'settings': '/api/settings/*',
            'pricing': '/api/pricing/*',
            'inventory': '/api/inventory/*',
            'technicians': '/api/technicians/*',
            'communication': '/api/communication/*',
            'business_intelligence': '/api/bi/*',
            'ai_features': '/api/ai/*'
        },
        'features': [
            'Customer Management',
            'Job Scheduling',
            'Financial Management',
            'Flat-Rate Pricing Engine',
            'Inventory Management',
            'Technician Management',
            'SMS & Email Communication',
            'Customer Questions & Notifications',
            'Advanced Business Intelligence',
            'Predictive Analytics',
            'Custom Reporting',
            'Revenue Forecasting',
            'Performance Analytics',
            'AI-Powered Job Scheduling',
            'Predictive Maintenance',
            'Smart Business Insights',
            'Automated Workflows',
            'Customer Behavior Analysis',
            'Intelligent Route Optimization'
        ]
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
