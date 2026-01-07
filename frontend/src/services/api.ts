import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on 401
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  verifyOTP: (token: string, otp: string) =>
    api.post(
      '/auth/verify-otp',
      { otp },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),
};

// Services API (2FA Hub as Authenticator App)
export const servicesAPI = {
  // Import a new service (from external website)
  import: (data: {
    secret: string;
    serviceName: string;
    issuer?: string;
    accountName?: string;
  }) => api.post('/totp/services', data),

  // Get all services with current OTP codes
  getAll: () => api.get('/totp/services'),

  // Delete a service
  remove: (id: string) => api.delete(`/totp/services/${id}`),

  // Get OTP for a specific service
  getOTP: (id: string) => api.get(`/totp/services/${id}/otp`),
};

export default api;
