import axios from 'axios';

// Determine API base URL
const getApiBaseUrl = (): string => {
  // In production (Vercel), use environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use local backend
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }
  
  // Fallback
  return '/api';
};

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
});

export default axiosInstance;
