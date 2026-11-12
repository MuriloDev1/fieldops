import { authService } from './services/api';

/** Sessão local criada pelo login em modo demonstração (sem backend). */
export const isDemoSession = () => {
  const token = authService.getStoredAccessToken();
  return typeof token === 'string' && token.startsWith('demo.');
};
