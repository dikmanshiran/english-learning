import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  parentId: string | null;
  email: string | null;
  isLoggedIn: boolean;
  setAuth: (accessToken: string, parentId: string, email: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  parentId: null,
  email: null,
  isLoggedIn: false,
  setAuth: (accessToken, parentId, email) =>
    set({ accessToken, parentId, email, isLoggedIn: true }),
  clearAuth: () =>
    set({ accessToken: null, parentId: null, email: null, isLoggedIn: false }),
}));
