import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const erpApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach dynamic headers
erpApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const institutionId = localStorage.getItem('x-institution-id');
  const academicYear = localStorage.getItem('x-academic-year') || '2024-2025';

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (institutionId) {
    config.headers['x-institution-id'] = institutionId;
  }
  config.headers['x-academic-year'] = academicYear;

  return config;
}, (error) => Promise.reject(error));

// Response interceptor for catching 401s
erpApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('x-institution-id');
      window.location.href = '/erp/login';
    }
    return Promise.reject(error);
  }
);
