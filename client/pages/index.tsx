'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../src/store/useAuthStore';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import Image from 'next/image';
import styles from './login.module.css';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.login);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const debug = await axios.get(
        'http://localhost:3001/auth/debug-headers',
        { withCredentials: true }
      );
      console.log('Debug Headers:', debug.data);

      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      const loginResponse = await axios.post(
        'http://localhost:3001/auth/login',
        { email, password },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (loginResponse.status !== 201) {
        throw new Error('Login failed');
      }

      console.log('Login Response Headers:', loginResponse.headers);
      console.log('Login Response Data:', loginResponse.data);

      const cookieTest = await axios.get(
        'http://localhost:3001/auth/debug-cookies',
        { withCredentials: true }
      );
      console.log('Cookie Test:', cookieTest.data);

      const meResponse = await axios.get('http://localhost:3001/auth/me', {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      setAuth({
        token: null,
        role: meResponse.data.user.role,
        permissions: meResponse.data.user.permissions,
      });

      window.location.href = '/permis_dashboard/PermisDashboard';
      
    } catch (err) {
      console.error('Login failed:', err);
      setError('Email ou mot de passe invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Left side - Branding/Illustration */}
      <div className={styles.brandSection}>
        <div className={styles.brandLogo}>
          <Image 
            src="/logo-white.png" 
            alt="SIGAM Logo" 
            width={400} 
            height={200} 
          />
        </div>
        <h1 className={styles.brandTitle}>Bienvenue sur SIGAM</h1>
        <p className={styles.brandSubtitle}>
          Système Intégré de Gestion des Autorisations Minières
        </p>
        <div className={styles.brandIllustration}>
          <Image 
            src="/auth-illustration.png" 
            alt="Authentication Illustration" 
            width={500} 
            height={400} 
          />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className={styles.loginFormSection}>
        <div className={styles.loginFormContainer}>
          <div className={styles.loginHeader}>
            <h2 className={styles.loginTitle}>Connexion</h2>
            <p className={styles.loginSubtitle}>Entrez vos identifiants pour accéder à votre compte</p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <FiAlertCircle className={styles.errorIcon} />
              <div>{error}</div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Adresse email
            </label>
            <div className={styles.inputContainer}>
              <FiMail className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className={styles.formInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Mot de passe
            </label>
            <div className={styles.inputContainer}>
              <FiLock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div className={styles.forgotPassword}>
              <a href="#" className={styles.forgotPasswordLink}>
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <span>
                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="20" height="20">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>

          <div className={styles.loginFooter}>
            <p>
              Vous n'avez pas de compte ?{' '}
              <Link href="/Signup/page" className={styles.footerLink}>
               Sign Up
              </Link>
            </p>
             <a href="/admin_panel/page" className={styles.footerLink}>
               Admin Page
              </a>
          </div>
        </div>
      </div>
    </div>
  );
}