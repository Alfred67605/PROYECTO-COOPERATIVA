import axios from 'axios';

const getBaseUrl = (): string => {
  const raw = import.meta.env.VITE_API_URL;
  if (raw && !raw.includes('localhost') && !raw.includes('127.0.0.1')) {
    const clean = raw.replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === '127.0.0.1') {
      return 'http://127.0.0.1:8000/api';
    }
    if (host !== 'localhost') {
      return `${window.location.origin}/api`;
    }
  }

  return 'http://localhost:8000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
});

export const getBackendRootUrl = (): string => {
  const currentBase = api.defaults.baseURL || getBaseUrl();
  return currentBase.replace(/\/api\/?$/, '');
};

// No need for request interceptor with Bearer token since we use HttpOnly session cookies

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/login') && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

