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
  ListChecks,
  AlertTriangle,
  History,
  ClipboardCheck,
  Wrench,
  ListTodo,
  UserRound,
} from 'lucide-react';

/**
 * Mapa único de navegação e permissões por perfil.
 * Perfis: ADMIN, SUPERVISOR, TECHNICIAN, CLIENT.
 */
export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPERVISOR', 'CLIENT'] },
  { path: '/my-inspections', label: 'Minhas Inspeções', icon: ClipboardCheck, roles: ['TECHNICIAN'] },
  { path: '/inspections', label: 'Inspeções', icon: ListTodo, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/clients', label: 'Clientes', icon: Building2, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/locations', label: 'Locais & Plantas', icon: MapPin, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/equipment', label: 'Equipamentos', icon: Settings2, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/templates', label: 'Modelos Checklist', icon: ListChecks, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/operations', label: 'Operações', icon: ClipboardList, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/service-orders', label: 'Ordens de Serviço', icon: Wrench, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/non-conformities', label: 'Não Conformidades', icon: AlertTriangle, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'] },
  { path: '/history', label: 'Histórico & Auditoria', icon: History, roles: ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'CLIENT'] },
  { path: '/team', label: 'Equipe de Campo', icon: Users, roles: ['ADMIN', 'SUPERVISOR'] },
  { path: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined, roles: ['ADMIN', 'SUPERVISOR', 'CLIENT'] },
  { path: '/reports', label: 'Relatórios', icon: FileText, roles: ['ADMIN', 'SUPERVISOR', 'CLIENT'] },
  { path: '/settings', label: 'Configurações', icon: Settings, roles: ['ADMIN'] },
];

// Rotas acessíveis a qualquer usuário autenticado, fora do menu lateral.
const COMMON_PATHS = ['/profile', '/inspection-flow'];
// Fluxo de execução do checklist: técnicos e supervisores.
const FLOW_ROLES = ['ADMIN', 'SUPERVISOR', 'TECHNICIAN'];

export const PROFILE_ITEM = { path: '/profile', label: 'Meu perfil', icon: UserRound };

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  TECHNICIAN: 'Técnico',
  CLIENT: 'Cliente',
};

export const normalizeRole = (role) => (role ? String(role).toUpperCase() : 'SUPERVISOR');

export const getNavItems = (role) => {
  const normalized = normalizeRole(role);
  return NAV_ITEMS.filter((item) => item.roles.includes(normalized));
};

export const getHomePath = (role) => {
  const items = getNavItems(role);
  return items.length > 0 ? items[0].path : '/profile';
};

export const canAccess = (role, pathname) => {
  const normalized = normalizeRole(role);
  if (pathname === '/inspection-flow') return FLOW_ROLES.includes(normalized);
  if (COMMON_PATHS.includes(pathname)) return true;
  return NAV_ITEMS.some(
    (item) =>
      item.roles.includes(normalized) &&
      (pathname === item.path || pathname.startsWith(`${item.path}/`))
  );
};

/** Indica se o caminho pertence a alguma rota conhecida do sistema. */
export const isKnownPath = (pathname) =>
  COMMON_PATHS.includes(pathname) ||
  NAV_ITEMS.some((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
