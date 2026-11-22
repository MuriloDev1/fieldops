/**
 * Utilitários puros para normalização e busca textual sem acentuação.
 */

/** Remove diacríticos, converte para minúsculas e trata nulos com segurança. */
export const normalizeText = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** Verifica se algum dos campos informados contém o termo de busca normalizado. */
export const matchesSearch = (query, fields = []) => {
  const term = normalizeText(String(query ?? '').trim());
  if (!term) return true;
  return fields.some((field) => normalizeText(field).includes(term));
};

/** Trunca textos longos preservando reticências quando excedem o limite. */
export const truncateText = (text, maxLength = 80) => {
  const value = String(text ?? '');
  if (maxLength <= 0) return '';
  if (value.length <= maxLength) return value;
  if (maxLength <= 3) return value.slice(0, maxLength);
  return `${value.slice(0, maxLength - 3)}...`;
};
