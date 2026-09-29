import Button from './Button';

const menu = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'inspections', label: 'Inspeções', icon: '✓' },
  { id: 'my-inspections', label: 'Minhas inspeções', icon: '◌' },
  { id: 'equipment', label: 'Equipamentos', icon: '◫' },
  { id: 'technicians', label: 'Técnicos', icon: '◍' },
  { id: 'nonconformities', label: 'Não conformidades', icon: '⚠' },
  { id: 'orders', label: 'Ordens de serviço', icon: '▣' },
  { id: 'history', label: 'Histórico', icon: '⎘' },
  { id: 'profile', label: 'Perfil', icon: '◔' },
];

export default function Sidebar({ activePage, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand-box">
        <div className="brand-mark">F</div>
        <div>
          <strong>FIELDOPS</strong>
          <span>Operação em campo</span>
        </div>
      </div>

      <Button className="new-dispatch" variant="primary" size="md" onClick={() => onNavigate('inspections')}>
        + Nova inspeção
      </Button>

      <nav className="side-nav" aria-label="Menu lateral">
        {menu.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-action">● Sistema online</button>
        <button type="button" className="sidebar-action" onClick={onLogout}>⇥ Sair</button>
      </div>
    </aside>
  );
}
