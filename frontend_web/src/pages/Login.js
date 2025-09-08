import React, { useState } from 'react';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      console.log('Tentative de connexion avec:', { username, password });
      const res = await api.post('/auth/login', { username, password });
      console.log('Réponse login:', res.data);
      localStorage.setItem('token', res.data.token);
      if (setIsAuthenticated) setIsAuthenticated(true);
      window.location.href = '/';
    } catch (err) {
      console.error('Erreur login:', err);
      if (err.response && err.response.status === 429) {
        setErrorMessage('Trop de tentatives. Veuillez réessayer après 15 minutes.');
      } else {
        setErrorMessage('Identifiants invalides');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark text-white">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Connexion Admin</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control bg-light text-dark"
                placeholder="Entrez votre nom d'utilisateur"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <div className="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control bg-light text-dark pe-5"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <span
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '15px',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                >
                  <FontAwesomeIcon icon={showPassword ? 'eye-slash' : 'eye'} />
                </span>
              </div>
            </div>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <button type="submit" className="btn btn-primary w-100 mt-3">
              Se connecter
            </button>
          </form>
          <p className="text-center mt-3 text-muted">The Vibes Admin - {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
