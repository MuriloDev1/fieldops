import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIORITY_CONFIG,
  NON_CONFORMITY_STATUS,
  USER_STATUS_LABELS,
  getInspectionStatusLabel,
  getInspectionStatusTone,
  getPriorityConfig,
  getStatusBadgeMeta,
} from '../utils/statusMaps.js';

describe('Mapeamento de status e prioridades (statusMaps.js)', () => {
  test('getInspectionStatusLabel traduz estados conhecidos e usa fallback seguro', () => {
    assert.equal(getInspectionStatusLabel('APPROVED'), 'Aprovada');
    assert.equal(getInspectionStatusLabel('ASSIGNED', 'Atribuída'), 'Atribuída');
    assert.equal(getInspectionStatusLabel('ASSIGNED'), 'Agendada');
    assert.equal(getInspectionStatusLabel(null), 'Pendente');
    assert.equal(getInspectionStatusLabel('CUSTOM'), 'CUSTOM');
  });

  test('getInspectionStatusTone mapeia cores semânticas por status', () => {
    assert.equal(getInspectionStatusTone('APPROVED'), 'success');
    assert.equal(getInspectionStatusTone('REJECTED'), 'danger');
    assert.equal(getInspectionStatusTone('SCHEDULED'), 'warning');
    assert.equal(getInspectionStatusTone('IN_PROGRESS'), 'info');
    assert.equal(getInspectionStatusTone('CANCELED'), 'slate');
  });

  test('getPriorityConfig retorna configuração de prioridade ou fallback neutro', () => {
    assert.equal(getPriorityConfig('CRITICAL').label, PRIORITY_CONFIG.CRITICAL.label);
    assert.equal(getPriorityConfig('UNKNOWN').label, 'UNKNOWN');
    assert.equal(getPriorityConfig(null).label, 'Média');
  });

  test('getStatusBadgeMeta resolve classe CSS e rótulo legível', () => {
    assert.deepEqual(getStatusBadgeMeta('CRITICAL'), { toneClass: 'danger', label: 'Crítico' });
    assert.deepEqual(getStatusBadgeMeta('MAINTENANCE'), { toneClass: 'warning', label: 'Manutenção' });
    assert.deepEqual(getStatusBadgeMeta('ACTIVE'), { toneClass: 'info', label: 'OK' });
    assert.deepEqual(getStatusBadgeMeta('Resolvida'), { toneClass: 'info', label: 'Resolvida' });
  });

  test('tabelas de não conformidade e usuário contêm chaves principais', () => {
    assert.equal(NON_CONFORMITY_STATUS.OPEN.label, 'Aberta');
    assert.equal(USER_STATUS_LABELS.BLOCKED, 'Crítico');
  });
});
