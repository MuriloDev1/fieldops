import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../core/context/AuthContext';

const demoProfiles = [
  { label: 'Supervisor', email: 'supervisor@fieldops.com' },
  { label: 'Técnico', email: 'tecnico@fieldops.com' },
  { label: 'Admin', email: 'admin@fieldops.com' },
];

export const LoginPage = () => {
  const [email, setEmail] = useState('supervisor@fieldops.com');
  const [password, setPassword] = useState('123456');
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate(from, { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectProfile = (profileEmail) => {
    setEmail(profileEmail);
    setPassword('123456');
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark large" aria-hidden="true">F</div>
          <h1>OpsControl Pro</h1>
          <p>Plataforma Administrativa & Inspeções de Campo</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">E-mail corporativo</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="nome@empresa.com"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? 'Autenticando...' : 'Entrar como Supervisor'}
          </button>
        </form>

        <div className="login-profiles" aria-label="Perfis de acesso rápido">
          {demoProfiles.map((profile) => (
            <button
              key={profile.email}
              type="button"
              className={`login-chip ${email === profile.email ? 'active' : ''}`}
              onClick={() => selectProfile(profile.email)}
            >
              {profile.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
