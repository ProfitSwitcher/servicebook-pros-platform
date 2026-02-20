import { API_BASE_URL } from '@/lib/config'

// API Client for ServiceBook Pros Backend Integration
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
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
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          window.location.href = '/';
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {}
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', endpoint, error.message);
      throw error;
    }
  }

  // Authentication methods
  async login(credentialsOrUsername, password) {
    let credentials;
    if (typeof credentialsOrUsername === 'string') {
      credentials = { username: credentialsOrUsername, password };
    } else {
      credentials = credentialsOrUsername;
    }

    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.access_token || response.token) {
      this.setToken(response.access_token || response.token);
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

  // Customer methods
  async getCustomers() {
    return this.request('/customers/');
  }

  async getCustomer(id) {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(customerData) {
    return this.request('/customers/', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async updateCustomer(id, customerData) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(id) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Job methods
  async getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/jobs/?${query}` : '/jobs/';
    return this.request(endpoint);
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
  async getEstimates(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/estimates/?${query}` : '/estimates/';
    return this.request(endpoint);
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

  async updateEstimate(id, estimateData) {
    return this.request(`/estimates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(estimateData),
    });
  }

  async deleteEstimate(id) {
    return this.request(`/estimates/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoice methods
  async getInvoices(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/invoices/?${query}` : '/invoices/';
    return this.request(endpoint);
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

  async updateInvoice(id, invoiceData) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  // Payment methods
  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/payments/?${query}` : '/payments/';
    return this.request(endpoint);
  }

  // Analytics methods
  async getAnalytics() {
    return this.request('/analytics/dashboard');
  }

  async getAnalyticsSummary() {
    return this.request('/analytics/summary');
  }

  async getRevenueByMonth() {
    return this.request('/analytics/revenue-by-month');
  }

  async getTopCustomers() {
    return this.request('/analytics/top-customers');
  }

  async getChurnAnalysis() {
    return [];
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

  async createPricing(pricingData) {
    return this.request('/pricing/', {
      method: 'POST',
      body: JSON.stringify(pricingData),
    });
  }

  async updatePricing(id, pricingData) {
    return this.request(`/pricing/${id}`, {
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

  async createTechnician(techData) {
    return this.request('/technicians/', {
      method: 'POST',
      body: JSON.stringify(techData),
    });
  }

  async updateTechnician(id, techData) {
    return this.request(`/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(techData),
    });
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
