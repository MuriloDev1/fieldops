import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function AppLayout({ children, title, activePage, onNavigate, search, setSearch, onLogout, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={onNavigate} onLogout={onLogout} />
      <div className={`mobile-overlay ${mobileMenuOpen ? 'visible' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <Sidebar activePage={activePage} onNavigate={(page) => { onNavigate(page); setMobileMenuOpen(false); }} onLogout={onLogout} />
      </div>
      <main className="main-panel">
        <Header
          title={title}
          subtitle=""
          search={search}
          setSearch={setSearch}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
        />
        <section className="content">{children}</section>
      </main>
    </div>
  );
}
