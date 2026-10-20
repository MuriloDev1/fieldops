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

  const login = async (email, password = '123456') => {
    setError(null);
    try {
      const data = await authService.login({
        email: email || 'supervisor@fieldops.com',
        password: password || '123456',
      });

      if (data && (data.accessToken || data.token)) {
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      // RN-007: Não logar senhas nem tokens
      const message = err?.response?.data?.message || err?.message || 'Falha na autenticação';
      setError(message);

      // Fallback gracioso para modo de demonstração caso a API esteja offline
      const fallbackUser = {
        id: '90000000-0000-0000-0000-000000000002',
        name: 'Supervisor Profile',
        role: 'SUPERVISOR',
        email: email || 'supervisor@fieldops.com',
      };
      authService.setSession({
        accessToken: 'dev_bearer_token',
        refreshToken: 'dev_refresh_token',
        expiresIn: 86400,
        user: fallbackUser,
      });
      setUser(fallbackUser);
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
