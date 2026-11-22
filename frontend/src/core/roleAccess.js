/**
 * Configuração pura de rotas e regras de acesso RBAC por perfil.
 * Mantida sem dependências de UI/ícones para permitir testes unitários diretos.
 * Perfis: ADMIN, SUPERVISOR, TECHNICIAN, CLIENT.
 */
export const ROUTE_DEFINITIONS = [
  { path: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'SUPERVISOR', 'CLIENT'] },
  { path: '/my-inspections', label: 'Minhas Inspeções', roles: ['TECHNICIAN'] },
  { path: '/inspections', label: 'Inspeções', roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/clients', label: 'Clientes', roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/locations', label: 'Locais & Plantas', roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/equipment', label: 'Equipamentos', roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/templates', label: 'Modelos Checklist', roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/operations', label: 'Operações', roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/service-orders', label: 'Ordens de Serviço', roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/non-conformities', label: 'Não Conformidades', roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/history', label: 'Histórico & Auditoria', roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'CLIENT'] },
  { path: '/team', label: 'Equipe de Campo', roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/analytics', label: 'Analytics', roles: ['ADMIN', 'SUPERVISOR', 'CLIENT'] },
  { path: '/reports', label: 'Relatórios', roles: ['ADMIN', 'SUPERVISOR', 'CLIENT'] },
  { path: '/settings', label: 'Configurações', roles: ['ADMIN'] },
];

export const COMMON_PATHS = ['/profile', '/inspection-flow'];
export const FLOW_ROLES = ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'];

export const PROFILE_ROUTE = { path: '/profile', label: 'Meu perfil' };

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  TECHNICIAN: 'Técnico',
  CLIENT: 'Cliente',
};

export const normalizeRole = (role) => (role ? String(role).toUpperCase() : 'SUPERVISOR');

export const getAccessibleRoutes = (role) => {
  const normalized = normalizeRole(role);
  return ROUTE_DEFINITIONS.filter((item) => item.roles.includes(normalized));
};

export const getHomePath = (role) => {
  const items = getAccessibleRoutes(role);
  return items.length > 0 ? items[0].path : '/profile';
};

export const canAccess = (role, pathname) => {
  const normalized = normalizeRole(role);
  if (pathname === '/inspection-flow') return FLOW_ROLES.includes(normalized);
  if (COMMON_PATHS.includes(pathname)) return true;
  return ROUTE_DEFINITIONS.some(
    (item) =>
      item.roles.includes(normalized) &&
      (pathname === item.path || pathname.startsWith(`${item.path}/`))
  );
};

/** Indica se o caminho pertence a alguma rota conhecida do sistema. */
export const isKnownPath = (pathname) =>
  COMMON_PATHS.includes(pathname) ||
  ROUTE_DEFINITIONS.some((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
