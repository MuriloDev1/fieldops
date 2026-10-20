/**
 * FieldOps Web - Módulo de Autenticação e Gestão de Sessão (RN-001, RN-007)
 * Tipagem estrita sem uso de 'any'.
 */

import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthUser,
} from '../types/api';

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'fieldops_token',
  REFRESH_TOKEN: 'fieldops_refresh_token',
  USER: 'fieldops_user',
} as const;

export const API_BASE_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:8080/api/v1';

export const authService = {
  /**
   * Realiza login na plataforma enviando credenciais (email e senha).
   * RN-007: Credenciais e tokens nunca são registrados em logs.
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/auth/login`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const data = response.data;
    if (data && (data.accessToken || data.token)) {
      this.setSession(data);
    }
    return data;
  },

  /**
   * Renova o token de acesso utilizando o refresh token persistido.
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const payload: RefreshTokenRequest = { refreshToken };
    const response = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}/auth/refresh`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const data = response.data;
    const newAccessToken = data.accessToken || data.token;
    if (newAccessToken) {
      this.updateTokens(newAccessToken, data.refreshToken || refreshToken);
    }
    return data;
  },

  /**
   * Encerra a sessão do usuário de forma segura.
   */
  async logout(): Promise<void> {
    try {
      const token = this.getStoredAccessToken();
      if (token) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(() => {
          // Falha silenciosa no servidor; a sessão local deve ser limpa obrigatoriamente
        });
      }
    } finally {
      this.clearSession();
    }
  },

  /**
   * Recupera o token de acesso persistido na sessão local.
   */
  getStoredAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Recupera o token de renovação persistido na sessão local.
   */
  getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Recupera o usuário logado persistido.
   */
  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  /**
   * Persiste a sessão autenticada.
   */
  setSession(authData: LoginResponse): void {
    if (typeof window === 'undefined') return;
    const accessToken = authData.accessToken || authData.token;
    if (accessToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (authData.refreshToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
    }
    if (authData.user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(authData.user));
    }
  },

  /**
   * Atualiza apenas os tokens da sessão.
   */
  updateTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  /**
   * Limpa todos os dados da sessão local.
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  },

  /**
   * Emite evento global de expiração de sessão e redireciona com segurança.
   */
  emitSessionExpired(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('fieldops:session-expired'));
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  },

  /**
   * Verifica se há um token de acesso ativo.
   */
  isAuthenticated(): boolean {
    return Boolean(this.getStoredAccessToken());
  },
};
