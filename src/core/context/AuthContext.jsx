import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fieldops_user');
    return savedUser ? JSON.parse(savedUser) : {
      id: 'usr_01',
      name: 'Supervisor Profile',
      role: 'Regional Supervisor',
      email: 'supervisor@fieldops.com'
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('fieldops_token') || user);
  });

  const login = (email) => {
    const mockUser = {
      id: 'usr_01',
      name: 'Supervisor Profile',
      role: 'Regional Supervisor',
      email: email || 'supervisor@fieldops.com'
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('fieldops_user', JSON.stringify(mockUser));
    localStorage.setItem('fieldops_token', 'mock_jwt_token_123456');
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('fieldops_user');
    localStorage.removeItem('fieldops_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook para consumir a autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
