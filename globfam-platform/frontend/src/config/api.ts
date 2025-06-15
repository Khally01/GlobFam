// API configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://your-backend.railway.app' 
    : 'http://localhost:3001');

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
};

// Socket.IO configuration
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

// Helper to build API endpoints
export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
  },
  users: {
    profile: '/api/users/profile',
    update: '/api/users/update',
  },
  // Add more endpoints as needed
};

export default API_CONFIG;