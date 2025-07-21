'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { FiHome, FiFile, FiMap, FiSettings, FiUsers, FiChevronRight, FiLogOut, 
         FiChevronLeft, FiActivity, FiBriefcase, FiClipboard, FiDollarSign, 
         FiFileText, FiLayers, FiLock, FiShield, FiChevronDown } from 'react-icons/fi';
import './sidebar.css';
import type { ViewType } from '../../src/types/viewtype';

interface MenuItemBase {
  id: ViewType;
  icon: React.ReactNode;
  label: string;
  permission: string;
}

interface MenuItemWithSubItems extends MenuItemBase {
  subItems: SubMenuItem[];
}

interface SubMenuItem extends MenuItemBase {}

type MenuItem = MenuItemBase | MenuItemWithSubItems;

function hasSubItems(item: MenuItem): item is MenuItemWithSubItems {
  return 'subItems' in item;
}

interface SidebarProps {
  currentView: ViewType;
  navigateTo: (view: ViewType) => void;
}

export default function Sidebar({ currentView, navigateTo }: SidebarProps) {
  const { auth, logout, hasPermission, isLoaded } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<ViewType | null>(null);

  if (!isLoaded) return (
    <aside className="sidebar-loading">
      <div className="loading-spinner"></div>
    </aside>
  );

  const menuItems: MenuItem[] = [
  { id: 'dashboard', icon: <FiActivity />, label: 'Tableau de bord', permission: 'dashboard' },
  { id: 'procedures', icon: <FiClipboard />, label: 'Procédures', permission: 'view_procedures' },
  { id: 'nouvelle-demande', icon: <FiFileText />, label: 'Nouvelle demande', permission: 'create_demande' },
  { id: 'gestion-permis', icon: <FiLayers />, label: 'Gestion des permis', permission: 'manage_permits' },
  { id: 'instruction-cadastrale', icon: <FiMap />, label: 'Instruction cadastrale', permission: 'view_cadastre' },
  { id: 'generateur-permis', icon: <FiBriefcase />, label: 'Générateur permis', permission: 'generate_permits' },
  { id: 'parametres', icon: <FiSettings />, label: 'Paramètres', permission: 'manage_settings' },
  { id: 'gestion-utilisateurs', icon: <FiUsers />, label: 'Utilisateurs', permission: 'manage_users' },
  { 
    id: 'Admin-Panel', 
    icon: <FiLock />, 
    label: 'Admin Panel', 
    permission: 'Admin-Panel',
    subItems: [
      { id: 'manage_users', icon: <FiUsers />, label: 'Manage Users', permission: 'manage_users' },
      { id: 'manage_documents', icon: <FiFile />, label: 'Manage Documents', permission: 'manage_documents' }
    ]
  },
  { id: 'Payments', icon: <FiDollarSign />, label: 'Paiements', permission: 'Payments' },
  { id: 'controle_minier', icon: <FiShield />, label: 'Contrôle minier', permission: 'controle_minier' }
];

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
              <li 
                key={item.id} 
                className="nav-item"
                onMouseEnter={() => hasSubItems(item) && setHoveredMenu(item.id)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <button
                  className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => !hasSubItems(item) && navigateTo(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="nav-label">{item.label}</span>
                      {hasSubItems(item) && (
                        <span className="nav-arrow">
                          <FiChevronDown />
                        </span>
                      )}
                    </>
                  )}
                </button>

                {!isCollapsed && hasSubItems(item) && (
                  <ul className={`sub-menu ${hoveredMenu === item.id ? 'visible' : ''}`}>
                    {item.subItems.map(subItem => (
                      hasPermission(subItem.permission) && (
                        <li 
                          key={subItem.id} 
                          className="sub-item"
                          onMouseEnter={() => setHoveredMenu(item.id)}
                        >
                          <button
                            className={`sub-link ${currentView === subItem.id ? 'active' : ''}`}
                            onClick={() => navigateTo(subItem.id)}
                          >
                            <span className="sub-icon">{subItem.icon}</span>
                            <span className="sub-label">{subItem.label}</span>
                          </button>
                        </li>
                      )
                    ))}
                  </ul>
                )}
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