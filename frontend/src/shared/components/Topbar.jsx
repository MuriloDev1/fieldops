import { Search, Bell, CircleHelp, UserRound, Menu } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';

export const Topbar = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onOpenMobileMenu}
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>
      <div className="search-box">
        <Search
          size={19}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <input
          type="text"
          placeholder="Search operations, teams, or reports..."
        />
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          aria-label="Notificações"
          title="Notificações"
        >
          <Bell size={20} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          aria-label="Ajuda"
          title="Ajuda"
        >
          <CircleHelp size={20} strokeWidth={1.8} />
        </button>

        <button
          type="button"
          aria-label="Perfil"
          title={user?.name || 'Perfil'}
        >
          <UserRound size={20} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
};