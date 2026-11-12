import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, CircleHelp, UserRound, Menu, LogOut, AlertTriangle, ClipboardList } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useToast } from '../../core/context/ToastContext';
import { getNavItems, PROFILE_ITEM, ROLE_LABELS, normalizeRole } from '../../core/permissions';
import { isDemoSession } from '../../core/demo';
import { nonConformitiesApi } from '../../core/services/api';
import { nonConformities as mockNonConformities, inspections as mockInspections } from '../../data/mockData';

const normalize = (text) =>
  String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Fecha o menu ao clicar fora ou pressionar Esc. */
const useDismiss = (ref, open, onClose) => {
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, open, onClose]);
};

const buildDemoAlerts = () => [
  ...mockNonConformities
    .filter((nc) => nc.status !== 'Resolvida')
    .map((nc) => ({
      id: nc.id,
      type: 'nc',
      title: nc.description,
      detail: `${nc.id} · ${nc.equipment}`,
      path: '/non-conformities',
    })),
  ...mockInspections
    .filter((inspection) => inspection.status === 'Pendente')
    .map((inspection) => ({
      id: inspection.id,
      type: 'inspection',
      title: `Inspeção pendente: ${inspection.name}`,
      detail: `${inspection.id} · ${inspection.equipment}`,
      path: '/inspections',
    })),
];

export const Topbar = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const searchRef = useRef(null);
  const alertsRef = useRef(null);
  const userRef = useRef(null);

  useDismiss(searchRef, searchOpen, () => setSearchOpen(false));
  useDismiss(alertsRef, alertsOpen, () => setAlertsOpen(false));
  useDismiss(userRef, userOpen, () => setUserOpen(false));

  const navItems = useMemo(() => [...getNavItems(user?.role), PROFILE_ITEM], [user?.role]);

  const results = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return [];
    return navItems.filter((item) => normalize(item.label).includes(term)).slice(0, 6);
  }, [query, navItems]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (isDemoSession()) {
        if (active) setAlerts(buildDemoAlerts());
        return;
      }
      try {
        const data = await nonConformitiesApi.getAll();
        if (!active || !Array.isArray(data)) return;
        setAlerts(
          data
            .filter((nc) => !['RESOLVED', 'CLOSED'].includes(nc.status))
            .slice(0, 8)
            .map((nc) => ({
              id: nc.id,
              type: 'nc',
              title: nc.description || nc.title || 'Não conformidade aberta',
              detail: nc.equipmentName || nc.equipment || 'Aguardando tratamento',
              path: '/non-conformities',
            }))
        );
      } catch {
        if (active) setAlerts([]);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const goTo = (path) => {
    setQuery('');
    setSearchOpen(false);
    setAlertsOpen(false);
    setUserOpen(false);
    navigate(path);
  };

  const handleSearchKey = (event) => {
    if (event.key === 'Enter' && results[0]) {
      event.preventDefault();
      goTo(results[0].path);
    }
  };

  const role = normalizeRole(user?.role);

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

      <div className="search-wrap" ref={searchRef}>
        <div className="search-box">
          <Search size={19} strokeWidth={1.8} aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKey}
            placeholder="Buscar operações, equipes ou relatórios..."
            aria-label="Buscar"
          />
        </div>

        {searchOpen && query.trim() && (
          <div className="dropdown search-results" role="listbox">
            {results.length > 0 ? (
              results.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.path} type="button" className="dropdown-item" onClick={() => goTo(item.path)}>
                    <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="dropdown-empty">Nenhum resultado para “{query}”.</div>
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        <div className="menu-wrap" ref={alertsRef}>
          <button
            type="button"
            aria-label="Notificações"
            title="Notificações"
            aria-expanded={alertsOpen}
            className="has-badge"
            onClick={() => setAlertsOpen((open) => !open)}
          >
            <Bell size={20} strokeWidth={1.8} />
            {alerts.length > 0 && <span className="notif-count">{alerts.length > 9 ? '9+' : alerts.length}</span>}
          </button>

          {alertsOpen && (
            <div className="dropdown notifications">
              <div className="dropdown-title">Avisos ({alerts.length})</div>
              {alerts.length === 0 ? (
                <div className="dropdown-empty">Tudo em dia. Nenhum aviso no momento.</div>
              ) : (
                <div className="dropdown-list">
                  {alerts.map((alert) => (
                    <button key={`${alert.type}-${alert.id}`} type="button" className="dropdown-item stacked" onClick={() => goTo(alert.path)}>
                      <span className={`alert-icon ${alert.type}`}>
                        {alert.type === 'nc' ? <AlertTriangle size={16} /> : <ClipboardList size={16} />}
                      </span>
                      <span className="alert-copy">
                        <strong>{alert.title}</strong>
                        <small>{alert.detail}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Ajuda"
          title="Ajuda"
          onClick={() => toast.info('Precisa de ajuda? Fale com o supervisor ou com o administrador do sistema.')}
        >
          <CircleHelp size={20} strokeWidth={1.8} />
        </button>

        <div className="menu-wrap" ref={userRef}>
          <button
            type="button"
            aria-label="Perfil"
            title={user?.name || 'Perfil'}
            aria-expanded={userOpen}
            onClick={() => setUserOpen((open) => !open)}
          >
            <UserRound size={20} strokeWidth={1.8} />
          </button>

          {userOpen && (
            <div className="dropdown user-menu">
              <div className="user-menu-head">
                <strong>{user?.name || 'Usuário'}</strong>
                <small>{ROLE_LABELS[role]}</small>
              </div>
              <button type="button" className="dropdown-item" onClick={() => goTo('/profile')}>
                <UserRound size={17} strokeWidth={1.8} aria-hidden="true" />
                <span>Meu perfil</span>
              </button>
              <button type="button" className="dropdown-item danger" onClick={logout}>
                <LogOut size={17} strokeWidth={1.8} aria-hidden="true" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
