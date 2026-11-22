/**
 * Utilitários puros de formatação de datas, CNPJ e telefones em padrão brasileiro.
 */

/** Formata data/hora ISO para pt-BR (dd/mm/aaaa, hh:mm). */
export function formatDateTimePtBr(isoString, fallback = 'Data não registrada') {
  if (!isoString) return fallback;
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return String(isoString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(isoString);
  }
}

/** Formata apenas a data (dd/mm/aaaa) em pt-BR. */
export function formatDatePtBr(isoString, fallback = '-') {
  if (!isoString) return fallback;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return date.toLocaleDateString('pt-BR');
}

/** Extrai YYYY-MM-DD de strings ISO com segurança. */
export function formatDateIsoShort(isoString, fallback = '-') {
  if (!isoString || typeof isoString !== 'string') return fallback;
  const trimmed = isoString.trim();
  if (trimmed.length < 10) return fallback;
  return trimmed.substring(0, 10);
}

/** Formata string numérica para CNPJ (00.000.000/0000-00) quando possuir 14 dígitos. */
export function formatCnpj(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length !== 14) return String(value ?? '');
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/** Formata telefone brasileiro (10 ou 11 dígitos). */
export function formatPhoneBr(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return String(value ?? '');
}
