import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isDemoToken } from '../utils/demoToken.js';

describe('Detecção de token de demonstração (demoToken.js)', () => {
  test('reconhece tokens prefixados com demo.', () => {
    assert.equal(isDemoToken('demo.1763820000000'), true);
    assert.equal(isDemoToken('demo.'), true);
  });

  test('rejeita JWTs reais, strings comuns e valores nulos', () => {
    assert.equal(isDemoToken('eyJhbGciOiJIUzI1NiJ9.abc.def'), false);
    assert.equal(isDemoToken('demo-refresh.123'), false);
    assert.equal(isDemoToken(''), false);
    assert.equal(isDemoToken(null), false);
    assert.equal(isDemoToken(undefined), false);
  });
});
