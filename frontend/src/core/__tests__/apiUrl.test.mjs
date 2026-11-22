import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LOCAL_API_URL, resolveApiBaseUrl } from '../utils/apiUrl.js';

describe('Resolução da URL base da API (apiUrl.js)', () => {
  test('prioriza envUrl configurada e remove barra final', () => {
    assert.equal(
      resolveApiBaseUrl({ envUrl: 'https://api.fieldops.com.br/api/v1/' }),
      'https://api.fieldops.com.br/api/v1'
    );
  });

  test('usa host remoto na porta 8080 quando fora de localhost', () => {
    assert.equal(
      resolveApiBaseUrl({ location: { protocol: 'http:', hostname: '54.12.34.56' } }),
      'http://54.12.34.56:8080/api/v1'
    );
    assert.equal(
      resolveApiBaseUrl({ location: { protocol: 'https:', hostname: 'app.fieldops.io' } }),
      'https://app.fieldops.io:8080/api/v1'
    );
  });

  test('retorna localhost padrão quando sem envUrl em ambiente local', () => {
    assert.equal(resolveApiBaseUrl({ location: { protocol: 'http:', hostname: 'localhost' } }), DEFAULT_LOCAL_API_URL);
    assert.equal(resolveApiBaseUrl({ location: { protocol: 'http:', hostname: '127.0.0.1' } }), DEFAULT_LOCAL_API_URL);
    assert.equal(resolveApiBaseUrl(), DEFAULT_LOCAL_API_URL);
  });
});
