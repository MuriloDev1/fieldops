import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isNonEmpty,
  isValidEmail,
  isValidCnpjFormat,
  isValidQrCode,
  validateClientForm,
  validateEquipmentForm,
} from '../utils/validators.js';

describe('Validadores puros de formulário (validators.js)', () => {
  test('isNonEmpty valida strings com e sem espaços', () => {
    assert.equal(isNonEmpty('FieldOps'), true);
    assert.equal(isNonEmpty('   '), false);
    assert.equal(isNonEmpty(null), false);
  });

  test('isValidEmail aceita e-mails válidos e rejeita inválidos', () => {
    assert.equal(isValidEmail('supervisor@fieldops.com'), true);
    assert.equal(isValidEmail('invalido@'), false);
    assert.equal(isValidEmail('sem-arroba.com'), false);
  });

  test('isValidCnpjFormat rejeita sequências repetidas e tamanhos incorretos', () => {
    assert.equal(isValidCnpjFormat('33.000.167/0001-01'), true);
    assert.equal(isValidCnpjFormat('11.111.111/1111-11'), false);
    assert.equal(isValidCnpjFormat('123456'), false);
  });

  test('isValidQrCode aceita códigos padronizados e rejeita inválidos', () => {
    assert.equal(isValidQrCode('QR-BOMBA-04'), true);
    assert.equal(isValidQrCode('AB'), false);
    assert.equal(isValidQrCode('QR COM ESPACO'), false);
  });

  test('validateClientForm aponta campos inválidos ou ausentes', () => {
    const empty = validateClientForm({});
    assert.equal(empty.valid, false);
    assert.ok(empty.errors.name);

    const invalid = validateClientForm({ name: 'Petrobras', email: 'errado', cnpj: '00000000000000' });
    assert.equal(invalid.valid, false);
    assert.ok(invalid.errors.email);
    assert.ok(invalid.errors.cnpj);

    const valid = validateClientForm({ name: 'Petrobras', email: 'contato@petrobras.com.br', cnpj: '33000167000101' });
    assert.equal(valid.valid, true);
  });

  test('validateEquipmentForm valida nome e QR Code', () => {
    assert.equal(validateEquipmentForm({ name: '' }).valid, false);
    assert.equal(validateEquipmentForm({ name: 'Bomba 01', qrCodeId: 'x' }).valid, false);
    assert.equal(validateEquipmentForm({ name: 'Bomba 01', qrCodeId: 'QR-001' }).valid, true);
  });
});
