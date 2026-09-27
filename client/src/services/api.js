import axios from 'axios';

// Automatically detect environment:
// 1. If VITE_API_BASE_URL is set in environment (e.g. Vercel / Production), use that.
// 2. If running locally on localhost/127.0.0.1, connect to http://localhost:5000.
// 3. Otherwise (Vercel fullstack same-domain deployment), use relative URL.
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return '';
  }
  return 'http://localhost:5000';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL
});

export default api;
export { API_BASE_URL };
