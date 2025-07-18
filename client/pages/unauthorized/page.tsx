import './unauthorized.css';
import { FiHome } from 'react-icons/fi'; // Modern home icon from Feather icons
import { useRouter } from 'next/navigation'; // for navigation in Next.js 13+

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="unauthorized-container">
      {/* 🏠 Home icon at the top */}
      <div className="home-icon" onClick={() => router.push('/')}>
        <FiHome size={28} />
      </div>

      <div className="unauthorized-box">
        <h1>403 - Accès refusé</h1>
        <p>Vous n’avez pas la permission d’accéder à cette page.</p>
      </div>
    </div>
  );
}
