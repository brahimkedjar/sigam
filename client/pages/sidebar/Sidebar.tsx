'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  FiHome,
  FiFile,
  FiMap,
  FiSettings,
  FiUsers,
  FiChevronRight,
  FiLogOut,
  FiChevronLeft,
  FiActivity,
  FiBriefcase,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiLock,
  FiShield
} from 'react-icons/fi';
import './sidebar.css';
import type { ViewType } from '../../src/types/viewtype';


interface SidebarProps {
  currentView: ViewType;
  navigateTo: (view: ViewType) => void;
}

export default function Sidebar({ currentView, navigateTo }: SidebarProps) {
  const { auth, logout, hasPermission, isLoaded } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (!isLoaded) return (
    <aside className="sidebar-loading">
      <div className="loading-spinner"></div>
    </aside>
  );

  const menuItems = [
  { id: 'dashboard', icon: <FiActivity />, label: 'Tableau de bord', permission: 'dashboard' },
  { id: 'procedures', icon: <FiClipboard />, label: 'Procédures', permission: 'view_procedures' },
  { id: 'nouvelle-demande', icon: <FiFileText />, label: 'Nouvelle demande', permission: 'create_demande' },
  { id: 'gestion-permis', icon: <FiLayers />, label: 'Gestion des permis', permission: 'manage_permits' },
  { id: 'instruction-cadastrale', icon: <FiMap />, label: 'Instruction cadastrale', permission: 'view_cadastre' },
  { id: 'generateur-permis', icon: <FiBriefcase />, label: 'Générateur permis', permission: 'generate_permits' },
  { id: 'parametres', icon: <FiSettings />, label: 'Paramètres', permission: 'manage_settings' },
  { id: 'gestion-utilisateurs', icon: <FiUsers />, label: 'Utilisateurs', permission: 'manage_users' },
  { id: 'Admin-Panel', icon: <FiLock />, label: 'Admin Panel', permission: 'Admin-Panel' },
  { id: 'Payments', icon: <FiDollarSign />, label: 'Paiements', permission: 'Payments' },
  { id: 'controle_minier', icon: <FiShield />, label: 'Contrôle minier', permission: 'controle_minier' }
]as const;;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>
      
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map(item => (
            hasPermission(item.permission) && (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => navigateTo(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-arrow">
                        <FiChevronRight />
                      </span>
                    </>
                  )}
                </button>
              </li>
            )
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="user-profile">
            <div className="avatar">
              {auth.role?.split(' ').map(w => w[0]).join('').toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-role">{auth.role || 'Utilisateur'}</span>
              <span className="user-status">En ligne</span>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={logout} title={isCollapsed ? "Déconnexion" : undefined}>
          <FiLogOut />
          {!isCollapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}