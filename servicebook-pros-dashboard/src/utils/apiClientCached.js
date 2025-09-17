import { API_BASE_URL } from '@/lib/config'
import cacheManager, { CacheStrategies, persistentCache } from './cacheManager'

class CachedApiClient {
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

  // Enhanced request method with caching
  async request(endpoint, options = {}) {
    const { method = 'GET', body, cache = false, cacheTTL, ...restOptions } = options;
    
    // Generate cache key for GET requests
    const cacheKey = cache && method === 'GET' ? 
      cacheManager.generateApiCacheKey(endpoint, body) : null;
    
    // Check cache for GET requests
    if (cacheKey && cacheManager.has(cacheKey)) {
      return cacheManager.get(cacheKey);
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: this.getHeaders(),
      ...restOptions,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.setToken(null);
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful GET responses
      if (cacheKey && method === 'GET') {
        cacheManager.set(cacheKey, data, cacheTTL || CacheStrategies.USER_DATA);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
      cacheManager.clear(); // Clear all cache on logout
      persistentCache.clear();
    }
  }

  // Cached customer methods
  async getCustomers(params = {}) {
    return this.request('/customers', {
      method: 'GET',
      body: params,
      cache: true,
      cacheTTL: CacheStrategies.CUSTOMER_DATA
    });
  }

  async getCustomer(id) {
    return this.request(`/customers/${id}`, {
      cache: true,
      cacheTTL: CacheStrategies.CUSTOMER_DATA
    });
  }

  async createCustomer(customerData) {
    const result = await this.request('/customers', {
      method: 'POST',
      body: customerData,
    });
    
    // Invalidate customers cache
    this.invalidateCache('customers');
    
    return result;
  }

  async updateCustomer(id, customerData) {
    const result = await this.request(`/customers/${id}`, {
      method: 'PUT',
      body: customerData,
    });
    
    // Invalidate related cache
    this.invalidateCache('customers');
    
    return result;
  }

  async deleteCustomer(id) {
    const result = await this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidate related cache
    this.invalidateCache('customers');
    
    return result;
  }

  // Cached job methods
  async getJobs(params = {}) {
    return this.request('/jobs', {
      method: 'GET',
      body: params,
      cache: true,
      cacheTTL: CacheStrategies.JOB_DATA
    });
  }

  async getJob(id) {
    return this.request(`/jobs/${id}`, {
      cache: true,
      cacheTTL: CacheStrategies.JOB_DATA
    });
  }

  async createJob(jobData) {
    const result = await this.request('/jobs', {
      method: 'POST',
      body: jobData,
    });
    
    this.invalidateCache('jobs');
    return result;
  }

  async updateJob(id, jobData) {
    const result = await this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: jobData,
    });
    
    this.invalidateCache('jobs');
    return result;
  }

  // Cached analytics methods
  async getAnalyticsSummary() {
    return this.request('/analytics/summary', {
      cache: true,
      cacheTTL: CacheStrategies.ANALYTICS_DATA
    });
  }

  async getRevenueByMonth() {
    return this.request('/analytics/revenue-by-month', {
      cache: true,
      cacheTTL: CacheStrategies.ANALYTICS_DATA
    });
  }

  async getTopCustomers() {
    return this.request('/analytics/top-customers', {
      cache: true,
      cacheTTL: CacheStrategies.ANALYTICS_DATA
    });
  }

  async getChurnAnalysis() {
    return this.request('/analytics/churn-analysis', {
      cache: true,
      cacheTTL: CacheStrategies.ANALYTICS_DATA
    });
  }

  // Cached financial methods
  async getInvoices(params = {}) {
    return this.request('/invoices', {
      method: 'GET',
      body: params,
      cache: true,
      cacheTTL: CacheStrategies.JOB_DATA
    });
  }

  async getPayments(params = {}) {
    return this.request('/payments', {
      method: 'GET',
      body: params,
      cache: true,
      cacheTTL: CacheStrategies.JOB_DATA
    });
  }

  // Cached estimates methods
  async getEstimates(params = {}) {
    return this.request('/estimates', {
      method: 'GET',
      body: params,
      cache: true,
      cacheTTL: CacheStrategies.JOB_DATA
    });
  }

  async createEstimate(estimateData) {
    const result = await this.request('/estimates', {
      method: 'POST',
      body: estimateData,
    });
    
    this.invalidateCache('estimates');
    return result;
  }

  // Cached settings methods
  async getSettings() {
    return this.request('/settings', {
      cache: true,
      cacheTTL: CacheStrategies.SETTINGS_DATA
    });
  }

  async updateSettings(settingsData) {
    const result = await this.request('/settings', {
      method: 'PUT',
      body: settingsData,
    });
    
    // Clear settings cache
    this.invalidateCache('settings');
    
    return result;
  }

  // Cache management methods
  invalidateCache(pattern) {
    const stats = cacheManager.getStats();
    stats.keys.forEach(key => {
      if (key.includes(pattern)) {
        cacheManager.delete(key);
      }
    });
  }

  clearCache() {
    cacheManager.clear();
    persistentCache.clear();
  }

  getCacheStats() {
    return cacheManager.getStats();
  }

  // Preload critical data
  async preloadCriticalData() {
    try {
      // Preload frequently accessed data
      await Promise.all([
        this.getCustomers({ limit: 50 }),
        this.getJobs({ status: 'active', limit: 20 }),
        this.getAnalyticsSummary(),
        this.getSettings()
      ]);
    } catch (error) {
      console.warn('Failed to preload critical data:', error);
    }
  }
}

// Create singleton instance
const cachedApiClient = new CachedApiClient();

export default cachedApiClient;

