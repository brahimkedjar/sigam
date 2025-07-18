// store/useAuthStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthData {
  token: null;
  role: string | null;
  permissions: string[];
}

interface AuthStore {
  auth: AuthData;
  isLoaded: boolean;
  login: (data: AuthData) => void;
  logout: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      auth: {
        token: null,
        role: null,
        permissions: [],
      },
      isLoaded: false,

      login: (data) => {
        set({ auth: data, isLoaded: true });
      },

      logout: async () => {
        try {
          await fetch('http://localhost:3001/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (err) {
          console.error('❌ Logout API error:', err);
        } finally {
          // Always clear state regardless of fetch outcome
          set({
            auth: { token: null, role: null, permissions: [] },
            isLoaded: true,
          });

          // Optional: redirect
          window.location.href = '/';
        }
      },

      hasPermission: (perm) => get().auth.permissions.includes(perm),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        auth: state.auth,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          setTimeout(() => {
            useAuthStore.setState({ isLoaded: true });
          }, 0);
        }
      },
    }
  )
);
