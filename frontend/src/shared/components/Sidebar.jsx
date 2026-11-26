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
  UserRound,
  ListChecks,
  AlertTriangle,
  History
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/clients', label: 'Clientes', icon: Building2, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/locations', label: 'Locais & Plantas', icon: MapPin, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/equipment', label: 'Equipamentos', icon: Settings2, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/templates', label: 'Modelos Checklist', icon: ListChecks, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/operations', label: 'Operações', icon: ClipboardList, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/non-conformities', label: 'Não Conformidades', icon: AlertTriangle, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/history', label: 'Histórico & Auditoria', icon: History, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/team', label: 'Equipe & Usuários', icon: Users, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/reports', label: 'Relatórios', icon: FileText, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/settings', label: 'Configurações', icon: Settings, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
];

const roleDisplayLabels = {
  ADMIN: 'Administrador Geral',
  SUPERVISOR: 'Supervisor Operacional',
  TECHNICIAN: 'Técnico de Campo',
};

export const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const currentRole = (user?.role || 'SUPERVISOR').toUpperCase();
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(currentRole)
  );

  return (
    <aside className="sidebar">
      <div className="brand-box">
        <div className="brand-logo">OpsControl Pro</div>
      </div>

      <nav className="side-nav" aria-label="Menu lateral">
        {visibleNavItems.map((item) => {
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
            {user?.name || 'Roberto Silva'}
          </div>

          <div className="profile-role">
            {roleDisplayLabels[currentRole] || user?.role || 'Supervisor Operacional'}
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