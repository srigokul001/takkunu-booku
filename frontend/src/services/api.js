import axios from 'axios';

// Base API URL: uses VITE_API_URL or defaults to production Render URL in production
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://takkunu-booku.onrender.com' : 'http://localhost:5000');

const api = axios.create({
  baseURL: `${API_URL.replace(/\/+$/, '')}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRequest =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register');

      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject(error);
  }
);

export default api;