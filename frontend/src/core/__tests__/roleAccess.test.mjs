import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROUTE_DEFINITIONS,
  ROLE_LABELS,
  normalizeRole,
  getAccessibleRoutes,
  getHomePath,
  canAccess,
  isKnownPath,
} from '../roleAccess.js';

describe('Controle de acesso e rotas por perfil (roleAccess)', () => {
  test('normalizeRole padroniza caixa e aplica SUPERVISOR como fallback', () => {
    assert.equal(normalizeRole('admin'), 'ADMIN');
    assert.equal(normalizeRole('Technician'), 'TECHNICIAN');
    assert.equal(normalizeRole(null), 'SUPERVISOR');
    assert.equal(normalizeRole(''), 'SUPERVISOR');
  });

  test('ROLE_LABELS possui rótulos para todos os perfis suportados', () => {
    assert.deepEqual(Object.keys(ROLE_LABELS), ['ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'CLIENT']);
  });

  test('getHomePath direciona cada perfil para sua rota inicial esperada', () => {
    assert.equal(getHomePath('ADMIN'), '/dashboard');
    assert.equal(getHomePath('SUPERVISOR'), '/dashboard');
    assert.equal(getHomePath('CLIENT'), '/dashboard');
    assert.equal(getHomePath('TECHNICIAN'), '/my-inspections');
    assert.equal(getHomePath('UNKNOWN_ROLE'), '/profile');
  });

  test('ADMIN possui acesso total inclusive /settings', () => {
    const routes = getAccessibleRoutes('ADMIN').map((r) => r.path);
    assert.ok(routes.includes('/settings'));
    assert.ok(routes.includes('/team'));
    assert.ok(!routes.includes('/my-inspections'));
    assert.equal(canAccess('ADMIN', '/settings'), true);
    assert.equal(canAccess('ADMIN', '/inspection-flow'), true);
  });

  test('SUPERVISOR não acessa /settings nem /my-inspections', () => {
    assert.equal(canAccess('SUPERVISOR', '/operations'), true);
    assert.equal(canAccess('SUPERVISOR', '/settings'), false);
    assert.equal(canAccess('SUPERVISOR', '/my-inspections'), false);
  });

  test('TECHNICIAN acessa fluxo de campo e não acessa telas administrativas', () => {
    assert.equal(canAccess('TECHNICIAN', '/my-inspections'), true);
    assert.equal(canAccess('TECHNICIAN', '/equipment'), true);
    assert.equal(canAccess('TECHNICIAN', '/non-conformities'), true);
    assert.equal(canAccess('TECHNICIAN', '/inspection-flow'), true);
    assert.equal(canAccess('TECHNICIAN', '/clients'), false);
    assert.equal(canAccess('TECHNICIAN', '/settings'), false);
  });

  test('CLIENT possui acesso somente leitura a dashboard, histórico, analytics e relatórios', () => {
    assert.equal(canAccess('CLIENT', '/dashboard'), true);
    assert.equal(canAccess('CLIENT', '/history'), true);
    assert.equal(canAccess('CLIENT', '/analytics'), true);
    assert.equal(canAccess('CLIENT', '/reports'), true);
    assert.equal(canAccess('CLIENT', '/inspection-flow'), false);
    assert.equal(canAccess('CLIENT', '/operations'), false);
  });

  test('canAccess aceita sub-rotas e rotas comuns como /profile', () => {
    assert.equal(canAccess('CLIENT', '/profile'), true);
    assert.equal(canAccess('SUPERVISOR', '/clients/123'), true);
    assert.equal(canAccess('CLIENT', '/clients/123'), false);
  });

  test('isKnownPath diferencia rotas registradas de caminhos inexistentes', () => {
    for (const def of ROUTE_DEFINITIONS) {
      assert.equal(isKnownPath(def.path), true);
    }
    assert.equal(isKnownPath('/profile'), true);
    assert.equal(isKnownPath('/inspection-flow'), true);
    assert.equal(isKnownPath('/rota-inexistente'), false);
  });
});
