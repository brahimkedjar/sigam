'use client';

import styles from './unauthorized.module.css';
import { useSearchParams } from 'next/navigation';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';
import { useRouterWithLoading } from '@/src/hooks/useRouterWithLoading';

export default function Unauthorized() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get('reason');
  const router = useRouterWithLoading();

  const getMessage = () => {
    switch (reason) {
      case 'not_authenticated':
        return "Vous devez être connecté pour accéder à cette page.";
      case 'insufficient_role':
        return "Vous n'avez pas le rôle nécessaire pour accéder à cette page.";
      case 'missing_permissions':
        return "Vous n'avez pas les permissions requises pour accéder à cette page.";
      default:
        return "Accès refusé. Veuillez vérifier vos autorisations.";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.homeIcon} onClick={() => router.push('/')}>
        <FiHome size={26} />
      </div>

      <div className={styles.box}>
        <FiAlertTriangle size={36} color="#FFA500" />
        <h1>403 - Accès refusé</h1>
        <p className={styles.message}>{getMessage()}</p>
      </div>
    </div>
  );
}
