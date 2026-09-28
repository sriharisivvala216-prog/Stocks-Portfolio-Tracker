import axios from 'axios';

// Automatically detect environment:
// 1. If VITE_API_BASE_URL is set in environment (e.g. Render / Custom Backend), use that.
// 2. If running locally on localhost/127.0.0.1, connect to http://localhost:5000.
// 3. Otherwise (Vercel fullstack serverless deployment), use relative URL.
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    if (hostname.includes('onrender.com')) {
      return '';
    }
    // Default for Vercel or any remote frontend: point directly to live Render backend
    return 'https://stocks-portfolio-tracker-7gnq.onrender.com';
  }
  return 'http://localhost:5000';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL
});

// Ensure all endpoint paths route via /api for seamless local, Vercel Serverless, and Render routing
api.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('http') && !config.url.startsWith('/api')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }
  return config;
});

export default api;
export { API_BASE_URL };
