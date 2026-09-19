import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const sessionId = sessionStorage.getItem('sessionId');
  if (sessionId) config.headers['x-session-id'] = sessionId;
  return config;
});

export default api;