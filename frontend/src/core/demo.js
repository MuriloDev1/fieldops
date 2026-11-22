import { authService } from './services/api';
import { isDemoToken } from './utils/demoToken';

export { isDemoToken };

/** Sessão local criada pelo login em modo demonstração (sem backend). */
export const isDemoSession = () => isDemoToken(authService.getStoredAccessToken());
