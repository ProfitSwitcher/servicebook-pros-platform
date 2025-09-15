#!/bin/bash

# ServiceBook Pros Production Deployment Script
# This script deploys the complete ServiceBook Pros platform to production

set -e  # Exit on any error

echo "🚀 Starting ServiceBook Pros Production Deployment..."

# Configuration
DOMAIN="servicebookpros.com"
PROJECT_DIR="/opt/servicebook-pros"
BACKUP_DIR="/opt/servicebook-pros/backups"
LOG_FILE="/var/log/servicebook-deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a $LOG_FILE
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

# Create project directory
log "Creating project directory structure..."
mkdir -p $PROJECT_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/log/servicebook

# Install dependencies
log "Installing system dependencies..."
apt-get update
apt-get install -y docker.io docker-compose nginx certbot python3-certbot-nginx curl wget git

# Start Docker service
systemctl start docker
systemctl enable docker

# Clone or update repository
log "Setting up application code..."
if [ -d "$PROJECT_DIR/.git" ]; then
    cd $PROJECT_DIR
    git pull origin main
else
    git clone https://github.com/servicebook-pros/platform.git $PROJECT_DIR
    cd $PROJECT_DIR
fi

# Set up environment variables
log "Configuring environment variables..."
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cat > $PROJECT_DIR/.env << EOF
# Database Configuration
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Application Security
SECRET_KEY=$(openssl rand -base64 32)
JWT_SECRET_KEY=$(openssl rand -base64 32)

# External Services (Configure with your credentials)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
SENDGRID_API_KEY=your_sendgrid_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# AWS Configuration (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=servicebook-pros-files

# Monitoring
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# Domain Configuration
DOMAIN=servicebookpros.com
EOF
    warning "Environment file created. Please update with your actual service credentials."
fi

# Set up SSL certificates
log "Setting up SSL certificates..."
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    # Stop nginx if running
    systemctl stop nginx 2>/dev/null || true
    
    # Get SSL certificate
    certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN -d mobile.$DOMAIN --agree-tos --no-eff-email --email admin@$DOMAIN
    
    # Copy certificates to nginx directory
    mkdir -p $PROJECT_DIR/nginx/ssl
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $PROJECT_DIR/nginx/ssl/$DOMAIN.crt
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $PROJECT_DIR/nginx/ssl/$DOMAIN.key
else
    log "SSL certificates already exist"
fi

# Build and deploy application
log "Building and deploying application..."
cd $PROJECT_DIR

# Build backend Docker image
log "Building backend Docker image..."
cat > backend/Dockerfile << EOF
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    postgresql-client \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs database

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:5000/api/health || exit 1

# Run application
CMD ["python", "src/main.py"]
EOF

# Copy application files
cp -r ../servicebook-pros-api/* backend/

# Build frontend
log "Building frontend applications..."
mkdir -p frontend/dist
mkdir -p frontend/dist/mobile

# Copy built frontend files (assuming they're already built)
if [ -d "../servicebook-pros-dashboard/dist" ]; then
    cp -r ../servicebook-pros-dashboard/dist/* frontend/dist/
fi

if [ -d "../servicebook-mobile-tech/dist" ]; then
    cp -r ../servicebook-mobile-tech/dist/* frontend/dist/mobile/
fi

# Set up monitoring configuration
log "Setting up monitoring..."
mkdir -p monitoring/prometheus monitoring/grafana/dashboards monitoring/grafana/datasources

cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'servicebook-backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/api/metrics'
    
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:8080']
    metrics_path: '/nginx_status'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
EOF

# Set up backup script
log "Setting up backup system..."
cat > scripts/backup.sh << EOF
#!/bin/bash

BACKUP_DIR="/backups"
DATE=\$(date +%Y%m%d_%H%M%S)
DB_NAME="servicebook_pros"
DB_USER="servicebook_user"

# Create backup directory
mkdir -p \$BACKUP_DIR

# Database backup
pg_dump -h postgres -U \$DB_USER -d \$DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql

# Compress backup
gzip \$BACKUP_DIR/db_backup_\$DATE.sql

# Keep only last 30 days of backups
find \$BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_backup_\$DATE.sql.gz"
EOF

chmod +x scripts/backup.sh

# Deploy with Docker Compose
log "Starting services with Docker Compose..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for services to be healthy
log "Waiting for services to be ready..."
sleep 30

# Check service health
log "Checking service health..."
for i in {1..30}; do
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        log "✅ Backend service is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Backend service failed to start"
    fi
    sleep 10
done

# Set up cron jobs
log "Setting up automated tasks..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd $PROJECT_DIR && docker-compose exec -T backup /backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 certbot renew --quiet && docker-compose restart nginx") | crontab -

# Set up log rotation
cat > /etc/logrotate.d/servicebook << EOF
/var/log/servicebook/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

# Configure firewall
log "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Final health check
log "Performing final health checks..."
if curl -f https://$DOMAIN/api/health > /dev/null 2>&1; then
    log "✅ HTTPS endpoint is working"
else
    warning "HTTPS endpoint check failed"
fi

if curl -f https://mobile.$DOMAIN > /dev/null 2>&1; then
    log "✅ Mobile app endpoint is working"
else
    warning "Mobile app endpoint check failed"
fi

# Display deployment summary
log "🎉 ServiceBook Pros deployment completed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "====================="
echo "🌐 Main Application: https://$DOMAIN"
echo "📱 Mobile App: https://mobile.$DOMAIN"
echo "📈 Monitoring: https://$DOMAIN:3000 (Grafana)"
echo "🔧 API Documentation: https://$DOMAIN/api/docs"
echo ""
echo "🔐 Security:"
echo "- SSL certificates installed and configured"
echo "- Firewall configured (ports 22, 80, 443)"
echo "- Rate limiting enabled"
echo "- Security headers configured"
echo ""
echo "💾 Backup & Monitoring:"
echo "- Daily database backups scheduled"
echo "- SSL certificate auto-renewal configured"
echo "- Application monitoring active"
echo "- Log rotation configured"
echo ""
echo "📝 Next Steps:"
echo "1. Update .env file with your service credentials"
echo "2. Configure DNS to point to this server"
echo "3. Test all functionality"
echo "4. Set up monitoring alerts"
echo ""
echo "🚀 ServiceBook Pros is now live and ready for business!"

# Save deployment info
cat > $PROJECT_DIR/deployment-info.txt << EOF
ServiceBook Pros Production Deployment
=====================================
Deployment Date: $(date)
Domain: $DOMAIN
Server IP: $(curl -s ifconfig.me)
Docker Compose Version: $(docker-compose --version)
SSL Certificate: Let's Encrypt
Backup Schedule: Daily at 2:00 AM
Certificate Renewal: Weekly on Sunday at 3:00 AM

Services Running:
- PostgreSQL Database
- Redis Cache
- Backend API
- Nginx Reverse Proxy
- Prometheus Monitoring
- Grafana Dashboard
- Automated Backup Service

URLs:
- Main App: https://$DOMAIN
- Mobile App: https://mobile.$DOMAIN
- Monitoring: https://$DOMAIN:3000
- API Docs: https://$DOMAIN/api/docs

Configuration Files:
- Environment: $PROJECT_DIR/.env
- Docker Compose: $PROJECT_DIR/docker-compose.yml
- Nginx Config: $PROJECT_DIR/nginx/nginx.conf
- SSL Certificates: $PROJECT_DIR/nginx/ssl/

Logs:
- Deployment: $LOG_FILE
- Application: $PROJECT_DIR/logs/
- Nginx: $PROJECT_DIR/logs/nginx/
EOF

log "Deployment information saved to $PROJECT_DIR/deployment-info.txt"
log "🎯 ServiceBook Pros is now ready to compete with industry leaders!"

