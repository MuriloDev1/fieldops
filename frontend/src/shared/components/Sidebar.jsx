import { NavLink } from 'react-router-dom';
import { useAuth } from '../../core/context/AuthContext';

import { LogOut, UserRound } from 'lucide-react';
import { getNavItems, ROLE_LABELS, normalizeRole } from '../../core/permissions';

export const Sidebar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navItems = getNavItems(user?.role);

  return (
    <aside className="sidebar">
      <div className="brand-box">
        <div className="brand-mark" aria-hidden="true">F</div>
        <div className="brand-text">
          <div className="brand-logo">OpsControl Pro</div>
          <span className="brand-sub">FieldOps Admin</span>
        </div>
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

        <div className="profile-meta">
          <div className="profile-name">
            {user?.name || 'Perfil do Supervisor'}
          </div>

          <div className="profile-role">
            {ROLE_LABELS[normalizeRole(user?.role)]}
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={logout}
          title="Sair"
          aria-label="Sair"
        >
          <LogOut size={19} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
};