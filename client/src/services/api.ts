import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && !refreshing) {
      refreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        useAuthStore.getState().setAuth(data.accessToken, data.parentId, useAuthStore.getState().email || '');
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        refreshing = false;
        return api.request(error.config);
      } catch {
        useAuthStore.getState().clearAuth();
        refreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
