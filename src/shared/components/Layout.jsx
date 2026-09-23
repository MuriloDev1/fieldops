import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="main-panel">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <section className="content">
          <Outlet />
        </section>
      </main>
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
