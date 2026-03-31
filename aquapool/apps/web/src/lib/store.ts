import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  kycTier: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
    }),
    { name: 'aquapool-auth', partialize: (s) => ({ refreshToken: s.refreshToken, user: s.user }) }
  )
);

interface WalletState {
  wallets: unknown[];
  totalUsdValue: number;
  setWallets: (wallets: unknown[]) => void;
  setTotalUsdValue: (v: number) => void;
}

export const useWalletStore = create<WalletState>()((set) => ({
  wallets: [],
  totalUsdValue: 0,
  setWallets: (wallets) => set({ wallets }),
  setTotalUsdValue: (totalUsdValue) => set({ totalUsdValue }),
}));

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
