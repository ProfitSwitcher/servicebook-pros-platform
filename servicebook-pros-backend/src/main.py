import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from src.models.user import db, User
from src.routes.auth import auth_bp
from src.routes.user import user_bp
from src.routes.pricing import pricing_bp
from src.routes.customers import customers_bp
from src.routes.jobs import jobs_bp
from src.routes.invoices import invoices_bp
from src.routes.technicians import technicians_bp
from src.routes.analytics import analytics_bp
from src.routes.settings import settings_bp
from src.routes.payments import payments_bp
from src.routes.communication import communication_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'sbp-dev-secret-change-in-prod')

# CORS — allow the dashboard and marketing site origins
CORS(app, resources={r'/api/*': {'origins': '*'}})

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(pricing_bp, url_prefix='/api/pricing')
app.register_blueprint(customers_bp, url_prefix='/api/customers')
app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
app.register_blueprint(invoices_bp, url_prefix='/api/invoices')
app.register_blueprint(technicians_bp, url_prefix='/api/technicians')
app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(payments_bp, url_prefix='/api/payments')
app.register_blueprint(communication_bp, url_prefix='/api/communication')

# Database configuration
database_dir = os.path.join(os.path.dirname(__file__), 'database')
os.makedirs(database_dir, exist_ok=True)
db_url = os.environ.get('DATABASE_URL', f"sqlite:///{os.path.join(database_dir, 'app.db')}")
# Railway provides postgres:// but SQLAlchemy needs postgresql://
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()
    # Seed a default admin user if none exists
    if not User.query.filter_by(username='admin').first():
        admin = User(
            username='admin',
            email='admin@servicebookpros.com',
            company_name='ServiceBook Pros',
            role='admin'
        )
        admin.set_password(os.environ.get('ADMIN_PASSWORD', 'admin123'))
        db.session.add(admin)
        db.session.commit()

@app.get('/api/health')
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path and path and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    index_path = os.path.join(static_folder_path or '', 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(static_folder_path, 'index.html')
    return jsonify({'status': 'ServiceBook Pros API', 'version': '1.0'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
