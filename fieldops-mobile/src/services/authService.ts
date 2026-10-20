/**
 * FieldOps Mobile - Módulo de Autenticação e Gestão de Sessão (RN-001, RN-007)
 * Tipagem estrita: Sem uso de 'any'.
 */

import { apiClient, API_BASE_URL, onUnauthorized, notifyUnauthorized } from './api';
import { tokenStorage } from './tokenStorage';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  AuthUser,
} from '../types/api';

export const authService = {
  /**
   * Realiza login no aplicativo móvel com credenciais do operador.
   * RN-007: Tokens e senhas nunca são registrados em console/logs.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    const data = response.data;
    const accessToken = data.accessToken || data.token;

    if (accessToken) {
      await tokenStorage.setTokens(accessToken, data.refreshToken || accessToken);
    }
    if (data.user) {
      await tokenStorage.setUser(data.user);
    }

    return data;
  },

  /**
   * Renova a sessão utilizando o refresh token persistido.
   */
  async refreshToken(token?: string): Promise<RefreshTokenResponse> {
    const refreshToken = token || (await tokenStorage.getRefreshToken());
    if (!refreshToken) {
      throw new Error('Nenhum token de renovação disponível.');
    }

    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    const data = response.data;
    const newAccessToken = data.accessToken || data.token;

    if (newAccessToken) {
      await tokenStorage.updateAccessToken(newAccessToken, data.refreshToken || refreshToken);
    }

    return data;
  },

  /**
   * Encerra a sessão de forma segura no dispositivo móvel.
   */
  async logout(): Promise<void> {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        await apiClient.post('/auth/logout', {}).catch(() => {});
      }
    } finally {
      await tokenStorage.clearSession();
      notifyUnauthorized();
    }
  },

  /**
   * Obtém o usuário atualmente autenticado.
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    return tokenStorage.getUser();
  },

  /**
   * Registra um callback para reset de navegação quando a sessão for revogada.
   */
  registerUnauthorizedListener(callback: () => void): () => void {
    return onUnauthorized(callback);
  },

  /**
   * Verifica se o operador de campo está autenticado.
   */
  async isAuthenticated(): Promise<boolean> {
    return tokenStorage.isAuthenticated();
  },
};
