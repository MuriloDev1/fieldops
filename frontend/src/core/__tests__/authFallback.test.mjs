import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { shouldFallbackToDemo } from '../utils/authFallback.js';

describe('Política de fallback para modo demonstração (authFallback.js)', () => {
  test('desabilita fallback quando VITE_ALLOW_DEMO_LOGIN é false', () => {
    assert.equal(shouldFallbackToDemo(false, new Error('Network Error')), false);
  });

  test('não entra em modo demo quando backend recusa credencial com 401 ou 403', () => {
    assert.equal(shouldFallbackToDemo(true, { response: { status: 401 } }), false);
    assert.equal(shouldFallbackToDemo(true, { response: { status: 403 } }), false);
  });

  test('permite modo demo quando backend está offline ou indisponível (rede / 5xx)', () => {
    assert.equal(shouldFallbackToDemo(true, new Error('Network Error')), true);
    assert.equal(shouldFallbackToDemo(true, { response: { status: 502 } }), true);
    assert.equal(shouldFallbackToDemo(true, { response: { status: 503 } }), true);
  });
});
