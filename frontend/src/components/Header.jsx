export default function Header({ title, subtitle, search, setSearch, onOpenMobileMenu, mobileMenuOpen }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="mobile-menu-button" onClick={onOpenMobileMenu} aria-label="Abrir menu">
          ☰
        </button>
        <div>
          <div className="eyebrow">FieldOps</div>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="topbar-right">
        <label className="search-box" aria-label="Busca geral">
          <span>⌕</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar..." />
        </label>
        <button type="button" className="icon-button" aria-label="Notificações">🔔</button>
        <button type="button" className="icon-button" aria-label="Ajuda">?</button>
        <div className="user-badge">AC</div>
      </div>
    </header>
  );
}
