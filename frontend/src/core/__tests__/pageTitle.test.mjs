import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ROUTE_DEFINITIONS, PROFILE_ROUTE } from '../roleAccess.js';
import { DEFAULT_TITLE, resolvePageTitle } from '../utils/pageTitle.js';

describe('Resolução de título da aba (pageTitle.js)', () => {
  const allRoutes = [...ROUTE_DEFINITIONS, PROFILE_ROUTE];

  test('retorna título formatado para rotas conhecidas e extras', () => {
    assert.equal(resolvePageTitle('/dashboard', allRoutes), 'Dashboard — FieldOps');
    assert.equal(resolvePageTitle('/profile', allRoutes), 'Meu perfil — FieldOps');
    assert.equal(resolvePageTitle('/inspection-flow', allRoutes), 'Execução de Inspeção — FieldOps');
  });

  test('usa título padrão quando a rota não possui mapeamento', () => {
    assert.equal(resolvePageTitle('/nao-existe', allRoutes), DEFAULT_TITLE);
    assert.equal(resolvePageTitle('', allRoutes), DEFAULT_TITLE);
  });
});
