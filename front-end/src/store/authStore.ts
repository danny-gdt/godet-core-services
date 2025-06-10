import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  isInitializing: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      status: 'idle',
      isInitializing: true,
      login: ({ accessToken, refreshToken }) => {
        set({ accessToken, refreshToken, status: 'success' });
      },
      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null, status: 'idle' });
      },
      setUser: (user) => set({ user }),
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ refreshToken: state.refreshToken }), // only persist refreshToken
    }
  )
);

export default useAuthStore; 