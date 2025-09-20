import { API_BASE_URL } from '@/lib/config'
// API Client for ServiceBook Pros Backend Integration
// Updated with cache busting timestamp: 1757919828
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
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
    
    // Debug: show whether auth header is present
    if (process.env.NODE_ENV !== 'production') {
      const hasAuth = !!this.token
      console.log('🧪 apiClient headers prepared. Auth?', hasAuth)
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
      // Debug outgoing headers minimally (without dumping token value)
      const hasAuthHeader = !!config.headers?.Authorization
      console.log('➡️ Request config. Auth header present?', hasAuthHeader)
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
    // Support both login(username, password) and login({ username, password }) call sites
    if (typeof credentials === 'string') {
      const username = credentials
      const password = arguments[1]
      credentials = { username, password }
    }
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access_token || response.token) {
      this.setToken(response.access_token || response.token);
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
