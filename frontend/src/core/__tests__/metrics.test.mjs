import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateConformanceRate,
  countByStatus,
  filterByQueryAndStatus,
} from '../utils/metrics.js';

describe('Cálculo de métricas e filtros (metrics.js)', () => {
  test('calculateConformanceRate retorna 100 quando não há inspeções', () => {
    assert.equal(calculateConformanceRate(0, 0), 100);
    assert.equal(calculateConformanceRate(-2, 1), 100);
  });

  test('calculateConformanceRate calcula porcentagem e limita não conformidades ao total', () => {
    assert.equal(calculateConformanceRate(10, 2), 80);
    assert.equal(calculateConformanceRate(3, 1), 66.7);
    assert.equal(calculateConformanceRate(4, 10), 0);
  });

  test('countByStatus agrupa ocorrências com fallback UNKNOWN', () => {
    const counts = countByStatus([
      { status: 'APPROVED' },
      { status: 'APPROVED' },
      { status: 'REJECTED' },
      {},
    ]);
    assert.deepEqual(counts, { APPROVED: 2, REJECTED: 1, UNKNOWN: 1 });
  });

  test('filterByQueryAndStatus combina busca normalizada e filtro de status', () => {
    const data = [
      { id: '1', name: 'Bomba Hidráulica', status: 'ACTIVE' },
      { id: '2', name: 'Compressor Principal', status: 'MAINTENANCE' },
    ];
    const result = filterByQueryAndStatus(data, {
      query: 'hidraulica',
      status: 'ACTIVE',
      fields: (item) => [item.id, item.name],
    });
    assert.equal(result.length, 1);
    assert.equal(result[0].id, '1');
  });
});
