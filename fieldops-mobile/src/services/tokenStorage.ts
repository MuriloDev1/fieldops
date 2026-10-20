/**
 * FieldOps Mobile - Armazenamento Seguro de Tokens (RN-007)
 * Utiliza expo-secure-store no ambiente nativo (Android/iOS) com fallback para AsyncStorage no Expo Web.
 * Sanitização estrita: Tokens e credenciais nunca são impressos no console.
 * Tipagem estrita: Sem uso de 'any'.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../types/api';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fieldops_mobile_access_token',
  REFRESH_TOKEN: 'fieldops_mobile_refresh_token',
  USER: 'fieldops_mobile_user',
} as const;

let isSecureStoreAvailable: boolean | null = null;

async function checkSecureStore(): Promise<boolean> {
  if (isSecureStoreAvailable !== null) {
    return isSecureStoreAvailable;
  }
  if (Platform.OS === 'web') {
    isSecureStoreAvailable = false;
    return false;
  }
  try {
    isSecureStoreAvailable = await SecureStore.isAvailableAsync();
    return isSecureStoreAvailable;
  } catch {
    isSecureStoreAvailable = false;
    return false;
  }
}

export const tokenStorage = {
  /**
   * Recupera o access token armazenado de forma segura.
   */
  async getAccessToken(): Promise<string | null> {
    const isAvailable = await checkSecureStore();
    if (isAvailable) {
      return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    }
    return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Recupera o refresh token armazenado de forma segura.
   */
  async getRefreshToken(): Promise<string | null> {
    const isAvailable = await checkSecureStore();
    if (isAvailable) {
      return SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    }
    return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Persiste ambos os tokens de autenticação (Access Token e Refresh Token).
   */
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    const isAvailable = await checkSecureStore();
    if (isAvailable) {
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      ]);
    } else {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      ]);
    }
  },

  /**
   * Atualiza o access token (e opcionalmente o refresh token).
   */
  async updateAccessToken(accessToken: string, refreshToken?: string): Promise<void> {
    const isAvailable = await checkSecureStore();
    if (isAvailable) {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    }
  },

  /**
   * Salva os dados do usuário autenticado no dispositivo.
   */
  async setUser(user: AuthUser): Promise<void> {
    const json = JSON.stringify(user);
    const isAvailable = await checkSecureStore();
    if (isAvailable) {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, json);
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, json);
    }
  },

  /**
   * Recupera os dados do usuário autenticado no dispositivo.
   */
  async getUser(): Promise<AuthUser | null> {
    const isAvailable = await checkSecureStore();
    const raw = isAvailable
      ? await SecureStore.getItemAsync(STORAGE_KEYS.USER)
      : await AsyncStorage.getItem(STORAGE_KEYS.USER);

    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  /**
   * Remove tokens e encerra a sessão local com segurança.
   */
  async clearSession(): Promise<void> {
    const isAvailable = await checkSecureStore();
    if (isAvailable) {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER).catch(() => {}),
      ]);
    } else {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN).catch(() => {}),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN).catch(() => {}),
        AsyncStorage.removeItem(STORAGE_KEYS.USER).catch(() => {}),
      ]);
    }
  },

  /**
   * Verifica se o operador de campo possui sessão válida ativa.
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return Boolean(token);
  },
};
