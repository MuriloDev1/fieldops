import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDateTimePtBr,
  formatDatePtBr,
  formatDateIsoShort,
  formatCnpj,
  formatPhoneBr,
} from '../utils/formatters.js';

describe('Utilitários de formatação (formatters.js)', () => {
  test('formatDateTimePtBr trata nulos e datas inválidas com fallback seguro', () => {
    assert.equal(formatDateTimePtBr(null), 'Data não registrada');
    assert.equal(formatDateTimePtBr('', 'Sem data'), 'Sem data');
    assert.equal(formatDateTimePtBr('invalido'), 'invalido');
    const formatted = formatDateTimePtBr('2026-10-15T14:30:00Z');
    assert.match(formatted, /\d{2}\/\d{2}\/2026/);
  });

  test('formatDatePtBr retorna fallback para vazio e data válida formatada', () => {
    assert.equal(formatDatePtBr(null), '-');
    assert.equal(formatDatePtBr('2026-05-20T12:00:00Z'), new Date('2026-05-20T12:00:00Z').toLocaleDateString('pt-BR'));
  });

  test('formatDateIsoShort extrai prefixo YYYY-MM-DD', () => {
    assert.equal(formatDateIsoShort('2026-11-22T18:00:00Z'), '2026-11-22');
    assert.equal(formatDateIsoShort('2026-11'), '-');
    assert.equal(formatDateIsoShort(null), '-');
  });

  test('formatCnpj aplica máscara em 14 dígitos e preserva outros tamanhos', () => {
    assert.equal(formatCnpj('33000167000101'), '33.000.167/0001-01');
    assert.equal(formatCnpj('12345'), '12345');
  });

  test('formatPhoneBr formata celulares (11) e fixos (10)', () => {
    assert.equal(formatPhoneBr('11987654321'), '(11) 98765-4321');
    assert.equal(formatPhoneBr('1132244477'), '(11) 3224-4477');
    assert.equal(formatPhoneBr('999'), '999');
  });
});
