/**
 * Funções puras para cálculo de indicadores operacionais e filtragem de listas.
 */
import { matchesSearch } from './text.js';

/** Calcula taxa de conformidade percentual com uma casa decimal. */
export function calculateConformanceRate(totalInspections, openNonConformities) {
  const total = Number(totalInspections) || 0;
  if (total <= 0) return 100;
  const open = Math.max(0, Math.min(Number(openNonConformities) || 0, total));
  return Math.round(((total - open) * 1000) / total) / 10;
}

/** Agrupa quantidade de registros por chave de status. */
export function countByStatus(items = [], statusKey = 'status') {
  return items.reduce((acc, item) => {
    const key = item?.[statusKey] || 'UNKNOWN';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/** Filtra coleção por termo textual e filtro opcional de status. */
export function filterByQueryAndStatus(items = [], { query = '', status = '', fields = () => [] } = {}) {
  return items.filter((item) => {
    const matchStatus = !status || item?.status === status;
    if (!matchStatus) return false;
    return matchesSearch(query, fields(item));
  });
}
