import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_ITEMS, PROFILE_ITEM } from './permissions';

const BASE_TITLE = 'FieldOps';
const EXTRA_TITLES = { '/inspection-flow': 'Execução de Inspeção' };

/** Atualiza o título da aba conforme a rota atual. */
export function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = [...NAV_ITEMS, PROFILE_ITEM].find((item) => item.path === pathname);
    const label = match ? match.label : EXTRA_TITLES[pathname];
    document.title = label ? `${label} — ${BASE_TITLE}` : `${BASE_TITLE} — Painel Administrativo`;
  }, [pathname]);
}
