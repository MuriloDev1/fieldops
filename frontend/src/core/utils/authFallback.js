/**
 * Política de fallback para modo demonstração no login Web.
 * Evita mascarar erros explícitos de credencial (401/403) quando o backend está ativo.
 */
export function shouldFallbackToDemo(allowDemoLogin, error) {
  if (!allowDemoLogin) return false;
  const status = error?.response?.status;
  if (status === 401 || status === 403) return false;
  return true;
}
