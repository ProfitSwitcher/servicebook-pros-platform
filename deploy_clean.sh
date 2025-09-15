#!/bin/bash

# ServiceBook Pros - Clean Cache & Redeploy Script
# This script ensures a completely clean deployment with cache clearing

set -e  # Exit on any error

echo "🚀 ServiceBook Pros - Clean Deployment Script"
echo "=============================================="

# Configuration
BACKEND_URL="https://y0h0i3c8k75w.manus.space/api"
FRONTEND_DIR="/home/ubuntu/flat_rate_project/servicebook-pros-dashboard"
MOBILE_DIR="/home/ubuntu/flat_rate_project/servicebook-mobile-tech"

echo "📋 Configuration:"
echo "   Backend URL: $BACKEND_URL"
echo "   Frontend Dir: $FRONTEND_DIR"
echo "   Mobile Dir: $MOBILE_DIR"
echo ""

# Step 1: Verify backend is accessible
echo "🔍 Step 1: Verifying backend accessibility..."
if curl -s "https://y0h0i3c8k75w.manus.space/api/health" | grep -q "healthy"; then
    echo "   ✅ Backend is accessible and healthy"
else
    echo "   ❌ Backend is not accessible. Aborting deployment."
    exit 1
fi

# Step 2: Clean frontend build environment
echo "🧹 Step 2: Cleaning frontend build environment..."
cd "$FRONTEND_DIR"

# Remove all cached files
echo "   Removing node_modules..."
rm -rf node_modules

echo "   Removing build cache..."
rm -rf .vite
rm -rf dist
rm -rf build

echo "   Removing package lock..."
rm -f package-lock.json

echo "   ✅ Frontend environment cleaned"

# Step 3: Update API configuration with cache busting
echo "🔧 Step 3: Updating API configuration..."

# Create a timestamp for cache busting
TIMESTAMP=$(date +%s)

# Update API client with new backend URL and cache busting
cat > "$FRONTEND_DIR/src/utils/apiClient.js" << 'EOF'
// API Client for ServiceBook Pros Backend Integration
// Updated with cache busting timestamp: TIMESTAMP_PLACEHOLDER
class ApiClient {
  constructor(baseURL = process.env.REACT_APP_API_BASE || 'https://y0h0i3c8k75w.manus.space/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
    console.log('🔗 API Client initialized with baseURL:', this.baseURL);
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method with enhanced error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('🌐 Making API request to:', url);
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          this.setToken(null);
          window.location.href = '/';
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response data received');
      return data;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    console.log('🔐 Attempting login...');
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
      console.log('✅ Login successful');
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed, clearing token anyway');
    }
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Customer methods with enhanced logging
  async getCustomers() {
    console.log('👥 Fetching customers...');
    return this.request('/customers/');
  }

  async getCustomer(id) {
    console.log('👤 Fetching customer:', id);
    return this.request(`/customers/${id}`);
  }

  async createCustomer(customerData) {
    console.log('➕ Creating customer...');
    return this.request('/customers/', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id, customerData) {
    console.log('✏️ Updating customer:', id);
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id) {
    console.log('🗑️ Deleting customer:', id);
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Job methods
  async getJobs() {
    return this.request('/jobs/');
  }

  async getJob(id) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(jobData) {
    return this.request('/jobs/', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id, jobData) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  // Estimate methods
  async getEstimates() {
    return this.request('/estimates/');
  }

  async getEstimate(id) {
    return this.request(`/estimates/${id}`);
  }

  async createEstimate(estimateData) {
    return this.request('/estimates/', {
      method: 'POST',
      body: JSON.stringify(estimateData),
    });
  }

  // Invoice methods
  async getInvoices() {
    return this.request('/invoices/');
  }

  async getInvoice(id) {
    return this.request(`/invoices/${id}`);
  }

  async createInvoice(invoiceData) {
    return this.request('/invoices/', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  // Analytics methods
  async getAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getReports() {
    return this.request('/analytics/reports');
  }

  // Settings methods
  async getSettings() {
    return this.request('/settings/');
  }

  async updateSettings(settingsData) {
    return this.request('/settings/', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // Pricing methods
  async getPricing() {
    return this.request('/pricing/');
  }

  async updatePricing(pricingData) {
    return this.request('/pricing/', {
      method: 'PUT',
      body: JSON.stringify(pricingData),
    });
  }

  // Inventory methods
  async getInventory() {
    return this.request('/inventory/');
  }

  async updateInventoryItem(id, itemData) {
    return this.request(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  // Technician methods
  async getTechnicians() {
    return this.request('/technicians/');
  }

  async getTechnician(id) {
    return this.request(`/technicians/${id}`);
  }

  // Communication methods
  async sendSMS(data) {
    return this.request('/communication/sms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendEmail(data) {
    return this.request('/communication/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Business Intelligence methods
  async getBusinessIntelligence() {
    return this.request('/bi/dashboard');
  }

  // AI Features methods
  async getPredictiveMaintenance() {
    return this.request('/ai/predictive-maintenance');
  }

  async getSmartScheduling() {
    return this.request('/ai/smart-scheduling');
  }
}

// Create and export singleton instance
const apiClient = new ApiClient();
export default apiClient;
EOF

# Replace timestamp placeholder
sed -i "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/g" "$FRONTEND_DIR/src/utils/apiClient.js"

echo "   ✅ API configuration updated with timestamp: $TIMESTAMP"

# Step 4: Add cache busting to index.html
echo "🔄 Step 4: Adding cache busting to HTML..."
if [ -f "$FRONTEND_DIR/index.html" ]; then
    # Add cache busting meta tag
    sed -i "/<head>/a\\    <meta name=\"cache-bust\" content=\"$TIMESTAMP\">" "$FRONTEND_DIR/index.html"
fi

# Step 5: Fresh npm install
echo "📦 Step 5: Fresh npm install..."
npm install --force
echo "   ✅ Dependencies installed"

# Step 6: Build with cache busting
echo "🏗️ Step 6: Building frontend with cache busting..."

# Set environment variable for build
export REACT_APP_API_BASE="$BACKEND_URL"
export REACT_APP_CACHE_BUST="$TIMESTAMP"

npm run build
echo "   ✅ Frontend built successfully"

# Step 7: Verify build output
echo "🔍 Step 7: Verifying build output..."
if [ -d "$FRONTEND_DIR/dist" ]; then
    echo "   ✅ Build directory exists"
    
    # Check if API URL is in the built files
    if grep -r "y0h0i3c8k75w.manus.space" "$FRONTEND_DIR/dist/" > /dev/null; then
        echo "   ✅ New backend URL found in build files"
    else
        echo "   ⚠️ New backend URL not found in build files"
    fi
    
    # List build files
    echo "   📁 Build files:"
    ls -la "$FRONTEND_DIR/dist/"
else
    echo "   ❌ Build directory not found"
    exit 1
fi

echo ""
echo "🎯 Deployment Summary:"
echo "   - Cache cleared: ✅"
echo "   - API URL updated: ✅"
echo "   - Fresh build created: ✅"
echo "   - Cache busting timestamp: $TIMESTAMP"
echo ""
echo "📋 Next Steps:"
echo "   1. Deploy the frontend using: service_deploy_frontend"
echo "   2. Test the Customers page functionality"
echo "   3. Verify all API calls are working"
echo ""
echo "🔗 URLs to test:"
echo "   - Backend Health: $BACKEND_URL/../health"
echo "   - Frontend: Will be provided after deployment"
echo ""
echo "✅ Clean deployment preparation completed!"
EOF

