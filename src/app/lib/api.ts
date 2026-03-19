import axios from 'axios';

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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
};
