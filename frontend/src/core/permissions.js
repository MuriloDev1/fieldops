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
import {
  ROUTE_DEFINITIONS,
  PROFILE_ROUTE,
  ROLE_LABELS,
  normalizeRole,
  getHomePath,
  canAccess,
  isKnownPath,
} from './roleAccess';

const ROUTE_ICONS = {
  '/dashboard': LayoutDashboard,
  '/my-inspections': ClipboardCheck,
  '/inspections': ListTodo,
  '/clients': Building2,
  '/locations': MapPin,
  '/equipment': Settings2,
  '/templates': ListChecks,
  '/operations': ClipboardList,
  '/service-orders': Wrench,
  '/non-conformities': AlertTriangle,
  '/history': History,
  '/team': Users,
  '/analytics': ChartNoAxesCombined,
  '/reports': FileText,
  '/settings': Settings,
};

/**
 * Mapa único de navegação e permissões por perfil com ícones da interface.
 * Perfis: ADMIN, SUPERVISOR, TECHNICIAN, CLIENT.
 */
export const NAV_ITEMS = ROUTE_DEFINITIONS.map((route) => ({
  ...route,
  icon: ROUTE_ICONS[route.path],
}));

export const PROFILE_ITEM = { ...PROFILE_ROUTE, icon: UserRound };

export { ROLE_LABELS, normalizeRole, getHomePath, canAccess, isKnownPath };

export const getNavItems = (role) => {
  const normalized = normalizeRole(role);
  return NAV_ITEMS.filter((item) => item.roles.includes(normalized));
};
