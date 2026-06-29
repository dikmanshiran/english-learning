import api from './api';
import { useAuthStore } from '../store/authStore';

export async function register(email: string, password: string) {
  const { data } = await api.post('/auth/register', { email, password });
  useAuthStore.getState().setAuth(data.accessToken, data.parentId, data.email);
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  useAuthStore.getState().setAuth(data.accessToken, data.parentId, data.email);
  return data;
}

export async function logout() {
  await api.post('/auth/logout');
  useAuthStore.getState().clearAuth();
}

export async function refreshToken() {
  try {
    const { data } = await api.post('/auth/refresh');
    useAuthStore.getState().setAuth(data.accessToken, data.parentId, useAuthStore.getState().email || '');
    return true;
  } catch {
    return false;
  }
}
