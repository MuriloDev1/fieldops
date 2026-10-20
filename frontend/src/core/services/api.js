/**
 * Re-exporta os serviços oficiais da API FieldOps a partir do novo cliente HTTP tipado (/src/services/api.ts)
 * Mantém compatibilidade com os componentes e páginas existentes.
 */

export * from '../../services/api';
export { authService, apiClient } from '../../services/api';
