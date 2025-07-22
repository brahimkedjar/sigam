'use client';
import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export function useSessionLoader() {
  const login = useAuthStore((s) => s.login);
  const setLoaded = () => useAuthStore.setState({ isLoaded: true });

  useEffect(() => {
  const load = async () => {
    try {
      const res = await axios.get('http://localhost:3001/auth/me', {
        withCredentials: true,
      });

      console.log('✅ /auth/me response:', res.data);

      login({
        token: null,
        role: res.data.user.role,
        permissions: res.data.user.permissions,
      });
    } catch (err) {
      console.warn('⚠️ No session found', err);
    } finally {
      setLoaded();
    }
  };

  load();
}, []);

}
