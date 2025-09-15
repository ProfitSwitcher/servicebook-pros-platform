import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.models.materials import MaterialCategory, MaterialSubcategory, MasterMaterial, CompanyMaterial
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.company import company_bp
from src.routes.pricing import pricing_bp
from src.routes.materials import materials_bp
from src.routes.admin import admin_bp
from src.routes.invoice import invoice_bp
from src.routes.communication import communication_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'servicebook-pros-multitenant-secret-key-2025'

# Enable CORS for all routes with specific origins
CORS(app, 
     supports_credentials=True,
     origins=['*'],  # Allow all origins for now
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp)
app.register_blueprint(company_bp)
app.register_blueprint(pricing_bp)
app.register_blueprint(materials_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(invoice_bp)
app.register_blueprint(communication_bp)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Import all models to ensure they're created
from src.models.company import Company, CompanyUser
from src.models.pricing import (
    ServiceCategory, ServiceSubcategory, MasterService, 
    CompanyService, CompanyTaxRate, CompanyLaborRate
)
from src.models.invoice import (
    Customer, WorkOrder, Invoice, InvoiceLineItem, 
    Payment, InvoiceTemplate
)

with app.app_context():
    db.create_all()
    
    # Initialize demo data
    try:
        from init_demo_data import init_demo_data
        init_demo_data()
    except Exception as e:
        print(f"Warning: Could not initialize demo data: {e}")

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
    return {'status': 'healthy', 'service': 'ServiceBook Pros Multi-Tenant'}, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
