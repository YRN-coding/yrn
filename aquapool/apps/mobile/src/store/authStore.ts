import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  kycTier: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  login: async (accessToken, refreshToken, user) => {
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await SecureStore.setItemAsync('userId', user.id);
    set({ accessToken, user, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userId');
    set({ accessToken: null, user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const userId = await SecureStore.getItemAsync('userId');
    if (!refreshToken || !userId) return;

    try {
      const res = await fetch(`${process.env['EXPO_PUBLIC_API_URL']}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, refreshToken }),
      });
      const json = await res.json() as { success: boolean; data?: { accessToken: string; user: User } };
      if (json.success && json.data) {
        set({ accessToken: json.data.accessToken, user: json.data.user, isAuthenticated: true });
      }
    } catch {
      // Session expired, user must log in again
    }
  },
}));
