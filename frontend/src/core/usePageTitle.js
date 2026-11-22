import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_ITEMS, PROFILE_ITEM } from './permissions';
import { resolvePageTitle } from './utils/pageTitle';

/** Atualiza o título da aba conforme a rota atual. */
export function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = resolvePageTitle(pathname, [...NAV_ITEMS, PROFILE_ITEM]);
  }, [pathname]);
}
