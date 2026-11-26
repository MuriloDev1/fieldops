import { createContext, useContext, useState, useEffect } from 'react';
import { authService, authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [error, setError] = useState(null);

  useEffect(() => {
    // Sincroniza estado caso os interceptores detectem expiração ou revogação
    const handleSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('fieldops:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('fieldops:session-expired', handleSessionExpired);
    };
  }, []);

  const login = async (email, password = '') => {
    setError(null);
    const normalizedEmail = (email || '').trim().toLowerCase();
    const rawPassword = password || '';

    if (!normalizedEmail || !rawPassword) {
      setError('Informe e-mail e senha para autenticar.');
      return false;
    }

    try {
      const data = await authService.login({
        email: normalizedEmail,
        password: rawPassword,
      });

      if (data && (data.accessToken || data.token)) {
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
      setError('Resposta de autenticação inválida.');
      return false;
    } catch (err) {
      // RN-007: Não logar senhas nem tokens
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        (status === 401 || status === 403
          ? 'Credenciais inválidas ou usuário inativo.'
          : err?.message || 'Falha na autenticação.');

      // AC-AUTH & RN-001: Se o servidor respondeu erro de credencial/autorização, negar acesso
      if (err?.response) {
        setError(message);
        return false;
      }

      // Fallback de resiliência apenas quando o backend estiver offline (!err.response)
      // e somente para credenciais válidas de demonstração
      const demoAccounts = {
        'admin@fieldops.com': {
          id: '90000000-0000-0000-0000-000000000001',
          name: 'Administrador do Sistema',
          role: 'ADMIN',
          email: 'admin@fieldops.com',
        },
        'supervisor@fieldops.com': {
          id: '90000000-0000-0000-0000-000000000002',
          name: 'Roberto Silva',
          role: 'SUPERVISOR',
          email: 'supervisor@fieldops.com',
        },
        'tecnico@fieldops.com': {
          id: '90000000-0000-0000-0000-000000000003',
          name: 'Carlos Lima',
          role: 'TECHNICIAN',
          email: 'tecnico@fieldops.com',
        },
      };

      const matchedDemoUser = demoAccounts[normalizedEmail];
      if (!matchedDemoUser || rawPassword !== '123456') {
        setError('Credenciais inválidas.');
        return false;
      }

      authService.setSession({
        accessToken: 'dev_bearer_token',
        refreshToken: 'dev_refresh_token',
        expiresIn: 86400,
        user: matchedDemoUser,
      });
      setUser(matchedDemoUser);
      setIsAuthenticated(true);
      return true;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
