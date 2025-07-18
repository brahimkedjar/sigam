import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './register.css';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [message, setMessage] = useState('');
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]); // 🟢 Store fetched roles

  // 🟢 Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:3001/admin/roles');
        const fetchedRoles = response.data;
        setRoles(fetchedRoles);
        if (fetchedRoles.length > 0) {
          setForm((prev) => ({ ...prev, role: fetchedRoles[0].name }));
        }
      } catch (error) {
        console.error('❌ Failed to fetch roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/auth/register', form);
      setMessage('✅ Inscription réussie !');
    } catch (err) {
      setMessage('❌ Échec de l\'inscription.');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-card">
        <h2 className="register-title">Créer un compte</h2>

        {message && <p className="register-message">{message}</p>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Rôle</label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="register-button">S'inscrire</button>
      </form>
    </div>
  );
}
