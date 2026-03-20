import axios from 'axios';

const fallbackBaseUrl = (() => {
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }

  if (typeof window !== 'undefined' && window?.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:4000';
})();

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? fallbackBaseUrl;

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export const apiRoutes = {
  session: '/auth/session',
  login: '/auth/login',
  logout: '/auth/logout',
  dashboard: '/api/v1/dashboard',
  sync: '/api/v1/summaries/sync',
  wraps: '/api/v1/wraps',
  wrapSync: '/api/v1/wraps/sync',
};
