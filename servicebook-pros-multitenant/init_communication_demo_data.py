import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.user import db
from datetime import datetime, timedelta
from flask import Flask
import sqlite3

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def init_communication_demo_data():
    with app.app_context():
        try:
            # Get database path
            db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
            
            # Connect directly to SQLite
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Create customers table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS customers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    company_id INTEGER NOT NULL DEFAULT 1,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255),
                    phone VARCHAR(20),
                    address TEXT,
                    city VARCHAR(100),
                    state VARCHAR(50),
                    zip_code VARCHAR(10),
                    preferred_contact VARCHAR(10) DEFAULT 'phone',
                    opt_out_sms BOOLEAN DEFAULT 0,
                    opt_out_email BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create messages table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    company_id INTEGER NOT NULL DEFAULT 1,
                    customer_id INTEGER,
                    customer_name VARCHAR(255),
                    customer_phone VARCHAR(20),
                    customer_email VARCHAR(255),
                    message_type VARCHAR(10) NOT NULL,
                    direction VARCHAR(10) NOT NULL,
                    subject VARCHAR(255),
                    content TEXT NOT NULL,
                    twilio_sid VARCHAR(100),
                    sendgrid_message_id VARCHAR(100),
                    status VARCHAR(20) DEFAULT 'sent',
                    read BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Check if demo customers already exist
            cursor.execute("SELECT COUNT(*) FROM customers WHERE email = 'john.meyer@email.com'")
            if cursor.fetchone()[0] > 0:
                print("Communication demo data already exists")
                conn.close()
                return
            
            # Insert demo customers
            customers = [
                (1, 'John Meyer', 'john.meyer@email.com', '(406) 799-0536', '1251 Golf View Drive', 'Seeley Lake', 'MT', '59868', 'phone'),
                (1, 'Susan Scarr', 'susan.scarr@email.com', '(770) 480-9498', '916 Grand Ave', 'Missoula', 'MT', '59802', 'email'),
                (1, 'Michael Pritchard', 'michael.pritchard@email.com', '(406) 546-9299', '5855 La Voie Ln', 'Missoula', 'MT', '59808', 'phone'),
                (1, 'Bruce Hall', 'bruce.hall@email.com', '(719) 661-8955', '270 A Street', 'Seeley Lake', 'MT', '59868', 'phone')
            ]
            
            cursor.executemany('''
                INSERT INTO customers (company_id, name, email, phone, address, city, state, zip_code, preferred_contact)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', customers)
            
            # Get customer IDs
            cursor.execute("SELECT id, name FROM customers WHERE company_id = 1")
            customer_map = {name: id for id, name in cursor.fetchall()}
            
            # Insert demo messages
            now = datetime.utcnow()
            messages = [
                # John Meyer conversation
                (1, customer_map['John Meyer'], 'John Meyer', '(406) 799-0536', 'john.meyer@email.com', 'sms', 'outbound', None, 
                 'Hi John, your technician Mike will arrive between 2-4 PM today for the HVAC repair.', None, None, 'delivered', 1, 
                 (now - timedelta(hours=6)).isoformat()),
                
                (1, customer_map['John Meyer'], 'John Meyer', '(406) 799-0536', 'john.meyer@email.com', 'sms', 'inbound', None,
                 'Perfect, I\'ll be home. Thank you!', None, None, 'received', 1,
                 (now - timedelta(hours=5, minutes=55)).isoformat()),
                
                (1, customer_map['John Meyer'], 'John Meyer', '(406) 799-0536', 'john.meyer@email.com', 'sms', 'inbound', None,
                 'Thank you for the quick service today! Everything looks great.', None, None, 'received', 0,
                 (now - timedelta(minutes=30)).isoformat()),
                
                # Susan Scarr conversation
                (1, customer_map['Susan Scarr'], 'Susan Scarr', '(770) 480-9498', 'susan.scarr@email.com', 'email', 'outbound', 
                 'Your Estimate is Ready - ServiceBook Pros', 'Your estimate for the plumbing work is ready. Total: $1,250. Please let us know if you\'d like to proceed.',
                 None, None, 'delivered', 1, (now - timedelta(hours=3)).isoformat()),
                
                # Michael Pritchard conversation
                (1, customer_map['Michael Pritchard'], 'Michael Pritchard', '(406) 546-9299', 'michael.pritchard@email.com', 'sms', 'inbound', None,
                 'Can we reschedule tomorrow\'s appointment to Friday instead?', None, None, 'received', 0,
                 (now - timedelta(hours=2)).isoformat()),
                
                # Bruce Hall conversation
                (1, customer_map['Bruce Hall'], 'Bruce Hall', '(719) 661-8955', 'bruce.hall@email.com', 'sms', 'outbound', None,
                 'Hi Bruce, this is a reminder that your maintenance appointment is scheduled for tomorrow at 10 AM.',
                 None, None, 'delivered', 1, (now - timedelta(hours=1)).isoformat())
            ]
            
            cursor.executemany('''
                INSERT INTO messages (company_id, customer_id, customer_name, customer_phone, customer_email, 
                                    message_type, direction, subject, content, twilio_sid, sendgrid_message_id, 
                                    status, read, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', messages)
            
            conn.commit()
            conn.close()
            
            print("Communication demo data initialized successfully!")
            print(f"Created {len(customers)} customers and {len(messages)} messages")
            
        except Exception as e:
            print(f"Error initializing communication demo data: {e}")
            if 'conn' in locals():
                conn.rollback()
                conn.close()

if __name__ == '__main__':
    init_communication_demo_data()

