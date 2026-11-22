/**
 * Resolução pura da URL base da API REST para o cliente Web.
 */

export const DEFAULT_LOCAL_API_URL = 'http://localhost:8080/api/v1';

export function resolveApiBaseUrl({ envUrl, location } = {}) {
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  const hostname = location?.hostname;
  const protocol = location?.protocol || 'http:';
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:8080/api/v1`;
  }

  return DEFAULT_LOCAL_API_URL;
}
