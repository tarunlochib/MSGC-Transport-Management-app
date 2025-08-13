import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    // Validate response data structure
    if (response.data && typeof response.data === 'object') {
      return response;
    } else {
      // If response data is not an object, reject with an error
      return Promise.reject(new Error('Invalid response format from server'));
    }
  },
  (error) => {
    // Handle unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect automatically, let the component handle it
      console.warn('Unauthorized access detected');
    }
    
    // Ensure error has a proper structure
    if (!error.response) {
      error.response = {
        data: { error: 'Network error occurred' },
        status: 0
      };
    }
    
    return Promise.reject(error);
  }
);

// Generic CRUD operations with better error handling
export const apiService = {
  // GET request with pagination and filters
  get: async (endpoint, params = {}) => {
    try {
      const response = await api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  },

  // POST request
  post: async (endpoint, data = {}) => {
    try {
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  },

  // PUT request
  put: async (endpoint, data = {}) => {
    try {
      const response = await api.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  },

  // DELETE request
  delete: async (endpoint) => {
    try {
      const response = await api.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  },

  // PATCH request
  patch: async (endpoint, data = {}) => {
    try {
      const response = await api.patch(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PATCH ${endpoint} error:`, error);
      throw error;
    }
  },
};

// Specific API functions for different entities
export const bookingsAPI = {
  getAll: (params) => apiService.get('/bookings', params),
  getById: (id) => apiService.get(`/bookings/${id}`),
  create: (data) => apiService.post('/bookings', data),
  update: (id, data) => apiService.put(`/bookings/${id}`, data),
  delete: (id) => apiService.delete(`/bookings/${id}`),
};

export const customersAPI = {
  getAll: (params) => apiService.get('/customers', params),
  getById: (id) => apiService.get(`/customers/${id}`),
  create: (data) => apiService.post('/customers', data),
  update: (id, data) => apiService.put(`/customers/${id}`, data),
  delete: (id) => apiService.delete(`/customers/${id}`),
};

export const transportersAPI = {
  getAll: (params) => apiService.get('/transporters', params),
  getById: (id) => apiService.get(`/transporters/${id}`),
  create: (data) => apiService.post('/transporters', data),
  update: (id, data) => apiService.put(`/transporters/${id}`, data),
  delete: (id) => apiService.delete(`/transporters/${id}`),
};

export const vehiclesAPI = {
  getAll: (params) => apiService.get('/vehicles', params),
  getById: (id) => apiService.get(`/vehicles/${id}`),
  create: (data) => apiService.post('/vehicles', data),
  update: (id, data) => apiService.put(`/vehicles/${id}`, data),
  delete: (id) => apiService.delete(`/vehicles/${id}`),
};

export const driversAPI = {
  getAll: (params) => apiService.get('/drivers', params),
  getById: (id) => apiService.get(`/drivers/${id}`),
  create: (data) => apiService.post('/drivers', data),
  update: (id, data) => apiService.put(`/drivers/${id}`, data),
  delete: (id) => apiService.delete(`/drivers/${id}`),
};

export const expensesAPI = {
  getAll: (params) => apiService.get('/expenses', params),
  getById: (id) => apiService.get(`/expenses/${id}`),
  create: (data) => apiService.post('/expenses', data),
  update: (id, data) => apiService.put(`/expenses/${id}`, data),
  delete: (id) => apiService.delete(`/expenses/${id}`),
};

export const billingAPI = {
  generateBill: (data) => apiService.post('/billing/generate', data),
  getTransporters: () => apiService.get('/billing/transporters'),
};

export default api; 