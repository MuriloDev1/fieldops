import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, matchesSearch, truncateText } from '../utils/text.js';

describe('Utilitários de texto e busca (text.js)', () => {
  test('normalizeText remove acentos e padroniza minúsculas', () => {
    assert.equal(normalizeText('Inspeção Elétrica Águia'), 'inspecao eletrica aguia');
    assert.equal(normalizeText('Não Conformidade — Ação'), 'nao conformidade — acao');
    assert.equal(normalizeText(null), '');
    assert.equal(normalizeText(undefined), '');
    assert.equal(normalizeText(123), '123');
  });

  test('matchesSearch retorna true para busca vazia ou com espaços', () => {
    assert.equal(matchesSearch('', ['Bomba']), true);
    assert.equal(matchesSearch('   ', ['Bomba']), true);
  });

  test('matchesSearch localiza correspondências ignorando acentos e maiúsculas', () => {
    const fields = ['INS-001', 'Manutenção de Compressor', 'Refinaria Central'];
    assert.equal(matchesSearch('manutencao', fields), true);
    assert.equal(matchesSearch('COMPRESSOR', fields), true);
    assert.equal(matchesSearch('caldeira', fields), false);
  });

  test('truncateText limita comprimento e preserva textos curtos', () => {
    assert.equal(truncateText('Curto', 10), 'Curto');
    assert.equal(truncateText('Descrição muito longa', 10), 'Descriç...');
    assert.equal(truncateText('abc', 2), 'ab');
    assert.equal(truncateText('abc', 0), '');
  });
});
