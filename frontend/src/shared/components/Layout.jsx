import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../core/context/AuthContext';
import { canAccess, getHomePath, isKnownPath } from '../../core/permissions';

export const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  // Rota existente, mas sem permissão para o perfil logado.
  if (isKnownPath(pathname) && !canAccess(user?.role, pathname)) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="main-panel">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <section className="content">
          <Outlet />
        </section>
      </main>
      <BottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
      <div
        className={`mobile-overlay ${mobileMenuOpen ? 'visible' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
      </div>
    </div>
  );
};
