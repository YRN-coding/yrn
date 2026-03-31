import axios, { type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8000',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('aquapool-auth');
      if (raw) {
        const state = JSON.parse(raw) as { state: { accessToken?: string } };
        const token = state.state.accessToken;
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore
    }
  }
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const raw = localStorage.getItem('aquapool-auth');
        if (raw) {
          const state = JSON.parse(raw) as { state: { refreshToken?: string; user?: { id: string } } };
          const { refreshToken, user } = state.state;
          if (refreshToken && user) {
            const res = await axios.post<{ data: { accessToken: string } }>(
              `${process.env['NEXT_PUBLIC_API_URL']}/api/v1/auth/refresh`,
              { userId: user.id, refreshToken }
            );
            const newToken = res.data.data.accessToken;
            if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`;
            return api(original);
          }
        }
      } catch {
        // Token refresh failed — redirect to login
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
