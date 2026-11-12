import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { getNavItems } from '../../core/permissions';

/** Barra de navegação fixa inferior, exibida apenas em telas pequenas. */
export const BottomNav = ({ onOpenMenu }) => {
  const { user } = useAuth();
  const items = getNavItems(user?.role);
  const primary = items.slice(0, items.length > 4 ? 3 : 4);

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {primary.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
            <span>{item.label.split(' ')[0]}</span>
          </NavLink>
        );
      })}
      {items.length > 4 && (
        <button type="button" className="bottom-nav-item" onClick={onOpenMenu}>
          <Menu size={21} strokeWidth={1.8} aria-hidden="true" />
          <span>Menu</span>
        </button>
      )}
    </nav>
  );
};
