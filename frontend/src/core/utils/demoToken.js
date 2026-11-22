/** Identifica se um token de acesso pertence ao modo demonstração local. */
export const isDemoToken = (token) =>
  typeof token === 'string' && token.startsWith('demo.');
