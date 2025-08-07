'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { useRouterWithLoading } from '@/src/hooks/useRouterWithLoading';

interface AuthData {
  token: string | null; // Allow null for token
  id: number | null;
  username: string | null;
  email: string | null;
  role: string | null;
  permissions: string[];
}

interface AuthStore {
  auth: AuthData;
  isLoaded: boolean;
  login: (data: { token: string; user: Omit<AuthData, 'token'> }) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
}
const apiURL = process.env.NEXT_PUBLIC_API_URL;

export const useAuthStore = create<AuthStore>()(
  
   persist(
    (set, get) => ({
      auth: {
        token: null,
        id: null,
        username: null,
        email: null,
        role: null,
        permissions: [], // Initialize as empty array
      },
      isLoaded: false,

      login: (data) => {
        set({ 
          auth: {
            token: data.token, // This will be a string when logging in
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            permissions: data.user.permissions,
          },
          isLoaded: true,
        });
      },

      logout: async () => {
  const { token } = get().auth;
  
  try {
    // Clear server session
    await axios.post(`${apiURL}/auth/logout`, {}, {
      withCredentials: true // Important for cookies
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear client state
  set({
    auth: {
      token: null,
      id: null,
      username: null,
      email: null,
      role: null,
      permissions: [],
    },
    isLoaded: true,
  });
  
  // Force full page reload to ensure middleware runs
  window.location.href = '/';
},

      // useAuthStore.ts
initialize: async () => {
  try {
    const token = useAuthStore.getState().auth.token;
          const response = await axios.post(`${apiURL}/auth/verify`, 
            { token },
            { withCredentials: true }
          );

    if (response.data?.user) {
      const token = response.headers['set-cookie']?.[0]
        ?.match(/auth_token=([^;]+)/)?.[1];
      
      set({
        auth: {
          token: token || get().auth.token, // Fallback to existing token
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          role: response.data.user.role,
          permissions: response.data.user.permissions,
        },
        isLoaded: true,
      });
      return;
    }
  } catch (error) {
    console.log('Cookie auth failed, trying local storage');
  }

  // Fallback to local storage token if exists
  const { token } = get().auth;
  if (token) {
    try {
      const verifyResponse = await axios.post('http://localhost:3001/auth/verify', 
        { token },
        { withCredentials: true }
      );
      
      set({
        auth: {
          token,
          id: verifyResponse.data.user.id,
          username: verifyResponse.data.user.username,
          email: verifyResponse.data.user.email,
          role: verifyResponse.data.user.role,
          permissions: verifyResponse.data.user.permissions,
        },
        isLoaded: true,
      });
    } catch (error) {
      console.log('Token verification failed');
    }
  }

  set({ isLoaded: true });
},

     hasPermission: (perm) => {
        const { permissions } = get().auth;
        // Safely check permissions array
        return Array.isArray(permissions) && permissions.includes(perm);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        auth: {
          token: state.auth.token,
          // Include permissions in persisted state
          permissions: state.auth.permissions || []
        },
      }),
      onRehydrateStorage: () => (state) => {
        state?.initialize();
      },
    }
  
  )
);