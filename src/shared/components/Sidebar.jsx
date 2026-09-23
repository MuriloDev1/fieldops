import { NavLink } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';

import {
  LayoutDashboard,
  Building2,
  MapPin,
  Settings2,
  ClipboardList,
  Users,
  ChartNoAxesCombined,
  FileText,
  Settings,
  LogOut,
  UserRound
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clients', label: 'Clientes', icon: Building2 },
  { path: '/locations', label: 'Locais & Plantas', icon: MapPin },
  { path: '/equipment', label: 'Equipamentos', icon: Settings2 },
  { path: '/operations', label: 'Operações', icon: ClipboardList },
  { path: '/team', label: 'Equipe de Campo', icon: Users },
  { path: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { path: '/reports', label: 'Relatórios', icon: FileText },
  { path: '/settings', label: 'Configurações', icon: Settings },
];

export const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand-box">
        <div className="brand-logo">OpsControl Pro</div>
      </div>

      <nav className="side-nav" aria-label="Menu lateral">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon
                className="nav-icon"
                size={20}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="profile-card">
        <div className="avatar-circle">
          <UserRound size={20} />
        </div>

        <div style={{ flex: 1 }}>
          <div className="profile-name">
            {user?.name || 'Supervisor Profile'}
          </div>

          <div className="profile-role">
            {user?.role || 'Regional Supervisor'}
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Sair"
          aria-label="Sair"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LogOut size={19} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
};