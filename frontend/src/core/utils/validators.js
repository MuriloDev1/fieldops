/**
 * Validadores puros para formulários e identificadores do FieldOps Web.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QR_CODE_PATTERN = /^[A-Za-z0-9._-]{3,64}$/;

export function isNonEmpty(value) {
  return typeof value === 'string' ? value.trim().length > 0 : value != null && String(value).trim().length > 0;
}

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return EMAIL_PATTERN.test(email.trim());
}

/** Verifica formato básico de CNPJ (14 dígitos numéricos). */
export function isValidCnpjFormat(cnpj) {
  const digits = String(cnpj ?? '').replace(/\D/g, '');
  if (digits.length !== 14) return false;
  return !/^(\d)\1{13}$/.test(digits);
}

export function isValidQrCode(code) {
  if (typeof code !== 'string') return false;
  return QR_CODE_PATTERN.test(code.trim());
}

export function validateClientForm(form = {}) {
  const errors = {};
  if (!isNonEmpty(form.name)) errors.name = 'Nome da empresa é obrigatório.';
  if (isNonEmpty(form.email) && !isValidEmail(form.email)) errors.email = 'E-mail inválido.';
  if (isNonEmpty(form.cnpj) && !isValidCnpjFormat(form.cnpj)) errors.cnpj = 'CNPJ deve conter 14 dígitos válidos.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateEquipmentForm(form = {}) {
  const errors = {};
  if (!isNonEmpty(form.name)) errors.name = 'Nome do equipamento é obrigatório.';
  if (isNonEmpty(form.qrCodeId) && !isValidQrCode(form.qrCodeId)) {
    errors.qrCodeId = 'QR Code deve ter entre 3 e 64 caracteres alfanuméricos.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
