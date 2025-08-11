// components/Navbar.tsx
'use client';
import { FiSearch, FiBell, FiUser, FiChevronDown, FiLogOut, FiSettings, FiHelpCircle } from 'react-icons/fi';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css'
export default function Navbar() {
  const { auth, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate initials from role for avatar
  const getInitials = (role: string) => {
    return role?.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <nav className={styles['navbar']}>
      <div className={styles['navbar-header']}>
        <div className={styles['app-logo']}>
          <span>SIGAM</span>
          <span className={styles['app-version']}>v2.0</span>
        </div>
      </div>
      
      <div className={styles['navbar-search']}>
        <div className={styles['search-container']}>
          <FiSearch className={styles['search-icon']} />
          <input 
            type="text" 
            className={styles['search-input']}
            placeholder="Rechercher..." 
          />
        </div>
      </div>
      
      <div className={styles['navbar-user']}>
        <div className={styles['notification-icon']}>
          <FiBell />
          <span className={styles['notification-badge']}>3</span>
        </div>
        
        <div className={styles['profile-dropdown']} ref={dropdownRef}>
          <button 
            className={styles['profile-button']}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className={styles['user-avatar']}>
              <span className={styles['avatar-initials']}>{getInitials(auth.role!)}</span>
            </div>
            <div className={styles['user-info']}>
              <div className={styles['user-info']}>
    <span className={styles['user-name']}>{auth.username}</span>
    <span className={styles['user-email']}>{auth.email}</span>
  </div>
            </div>
            <FiChevronDown className={`${styles['dropdown-arrow']} ${isDropdownOpen ? styles['open'] : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className={styles['dropdown-menu']}>
              <div className={styles['dropdown-header']}>
                <div className={styles['dropdown-avatar']}>
                  <span className={styles['avatar-initials']}>{getInitials(auth.role!)}</span>
                </div>
                <div>
                  <div>
                                  <p className={styles['dropdown-name']}>Role : {auth.role}</p>

    <p className={styles['dropdown-name']}>{auth.username}</p>
    <p className={styles['dropdown-email']}>{auth.email}</p>
  </div>
                </div>
              </div>
              
              <div className={styles['dropdown-divider']}></div>
              
              <Link href="/profile" className={styles['dropdown-item']}>
                <FiUser className={styles['dropdown-icon']} />
                <span>Mon profil</span>
              </Link>
              
              <Link href="/settings" className={styles['dropdown-item']}>
                <FiSettings className={styles['dropdown-icon']} />
                <span>Paramètres</span>
              </Link>
              
              <Link href="/help" className={styles['dropdown-item']}>
                <FiHelpCircle className={styles['dropdown-icon']} />
                <span>Aide & Support</span>
              </Link>
              
              <div className={styles['dropdown-divider']}></div>
              
              <button onClick={logout} className={`${styles['dropdown-item']} ${styles['logout']}`}>
                <FiLogOut className={styles['dropdown-icon']} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}