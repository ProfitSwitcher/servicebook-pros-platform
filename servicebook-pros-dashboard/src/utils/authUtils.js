// JWT Token Authentication Utility

// 1. Token Storage Functions
export const tokenStorage = {
  // Store token after login
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  // Get token for API requests
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  // Clear token on logout
  removeToken: () => {
    localStorage.removeItem('token');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// 2. API Request with Token Helper
export const authHeader = () => {
  const token = tokenStorage.getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Example of making authenticated API request
export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    ...options.headers,
    ...authHeader(),
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // Token expired
      tokenStorage.removeToken();
      window.location.href = '/login';
      throw new Error('Authentication token expired');
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// 3. For Axios users - create interceptor
export const setupAxiosInterceptors = (axios) => {
  // Request interceptor - adds token to all requests
  axios.interceptors.request.use(
    config => {
      const token = tokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );
  
  // Response interceptor - handles token expiration
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        tokenStorage.removeToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  return axios;
};

// Usage examples:
/*
// On login:
import { tokenStorage } from './JWT_token_storage_check';

function handleLogin(username, password) {
  // After successful login API call:
  tokenStorage.setToken(responseData.token);
}

// For fetch API:
import { fetchWithAuth } from './JWT_token_storage_check';

async function getCustomers() {
  const response = await fetchWithAuth('/api/customers');
  const customers = await response.json();
  return customers;
}

// For Axios:
import axios from 'axios';
import { setupAxiosInterceptors } from './JWT_token_storage_check';

// Setup once in your app initialization
const api = setupAxiosInterceptors(axios.create({
  baseURL: '/api'
}));

// Then use it anywhere
async function getCustomers() {
  const response = await api.get('/customers');
  return response.data;
}
*/