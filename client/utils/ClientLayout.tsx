'use client';
import { useSessionLoader } from '../src/hooks/useSessionLoader';
import { useAuthStore } from '@/store/useAuthStore';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useSessionLoader();
  const isLoaded = useAuthStore(state => state.isLoaded);

  if (!isLoaded) {
    return <div>Chargement de session...</div>;
  }

  return <>{children}</>;
}
