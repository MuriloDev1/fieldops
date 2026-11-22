/**
 * Resolução pura de título de aba conforme a rota atual.
 */

export const BASE_TITLE = 'FieldOps';
export const DEFAULT_TITLE = `${BASE_TITLE} — Painel Administrativo`;
export const EXTRA_TITLES = { '/inspection-flow': 'Execução de Inspeção' };

export function resolvePageTitle(pathname, routes = [], extraTitles = EXTRA_TITLES) {
  const match = routes.find((item) => item.path === pathname);
  const label = match ? match.label : extraTitles[pathname];
  return label ? `${label} — ${BASE_TITLE}` : DEFAULT_TITLE;
}
