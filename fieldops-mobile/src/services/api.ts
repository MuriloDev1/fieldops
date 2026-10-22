/**
 * FieldOps Mobile - Cliente HTTP Tipado, Interceptores e Renovação JWT
 * Em conformidade com RN-001 (Acesso exclusivo a usuários ativos) e RN-007 (Sanitização estrita: credenciais/tokens nunca em logs).
 * Tipagem estrita: Sem uso de 'any'.
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from './tokenStorage';
export { tokenStorage };
import type {
  ApiErrorResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  Inspection,
  Equipment,
  EquipmentStatus,
  SubmitInspectionAnswersRequest,
  DashboardSummary,
  AuthUser,
} from '../types/api';

// Configuração da URL base da API
export const API_BASE_URL: string = (
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');


// Tipos e callbacks para reset de navegação quando a sessão for revogada/expirada
export type UnauthorizedCallback = () => void;
let unauthorizedListeners: UnauthorizedCallback[] = [];

export function onUnauthorized(callback: UnauthorizedCallback): () => void {
  unauthorizedListeners.push(callback);
  return () => {
    unauthorizedListeners = unauthorizedListeners.filter((cb) => cb !== callback);
  };
}

export function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // Callback seguro
    }
  });
}

// Interface para fila de espera de chamadas concorrentes durante renovação
interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

/**
 * Instância Axios configurada para o Mobile
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// ==========================================
// 1. Request Interceptor Assíncrono (SecureStore)
// ==========================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // RN-007: Sanitização estrita - nunca logar credenciais, senhas ou tokens
    return config;
  },
  (error: unknown): Promise<never> => {
    return Promise.reject(error);
  }
);

// ==========================================
// 2. Response Interceptor (Renovação JWT e Reset de Navegação)
// ==========================================
export interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>): Promise<AxiosResponse> => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;

    // Tratamento de 403 Forbidden: permissão insuficiente (RBAC)
    if (status === 403) {
      return Promise.reject(error);
    }

    // Tratamento de 401 Unauthorized
    if (status === 401) {
      if (!originalRequest) {
        return Promise.reject(error);
      }

      const url = originalRequest.url || '';
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh');

      // Se a própria tentativa de login ou refresh retornou 401, limpa credenciais e dispara reset de navegação
      if (isAuthRoute) {
        await tokenStorage.clearSession();
        notifyUnauthorized();
        return Promise.reject(error);
      }

      // Se a requisição já sofreu retry anteriormente, aborta e reseta sessão
      if (originalRequest._retry) {
        await tokenStorage.clearSession();
        notifyUnauthorized();
        return Promise.reject(error);
      }

      // Se já houver um processo de renovação em curso, enfileira a requisição concorrente
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      // Inicia renovação com bloqueio de concorrência
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        await tokenStorage.clearSession();
        notifyUnauthorized();
        return Promise.reject(error);
      }

      try {
        // Chamada direta para o endpoint de renovação sem reentrar no interceptor
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        );

        const newAccessToken = response.data.accessToken || response.data.token;
        const newRefreshToken = response.data.refreshToken || refreshToken;

        if (!newAccessToken) {
          throw new Error('Servidor não retornou um access token válido.');
        }

        // Armazena com segurança no SecureStore
        await tokenStorage.updateAccessToken(newAccessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Desbloqueia e processa todas as chamadas que aguardavam na fila
        processQueue(null, newAccessToken);

        // Repete a requisição original
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        await tokenStorage.clearSession();
        notifyUnauthorized();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================
// 3. Cliente Wrapper Tipado
// ==========================================
export const api = {
  get: <T = unknown>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get<T>(endpoint, config).then((res: AxiosResponse<T>) => res.data),

  post: <T = unknown, B = unknown>(endpoint: string, body?: B, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post<T>(endpoint, body, config).then((res: AxiosResponse<T>) => res.data),

  put: <T = unknown, B = unknown>(endpoint: string, body?: B, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put<T>(endpoint, body, config).then((res: AxiosResponse<T>) => res.data),

  patch: <T = unknown, B = unknown>(endpoint: string, body?: B, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch<T>(endpoint, body, config).then((res: AxiosResponse<T>) => res.data),

  delete: <T = unknown>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete<T>(endpoint, config).then((res: AxiosResponse<T>) => res.data),
};

// ==========================================
// 4. Módulos de Serviço Mobile da API
// ==========================================

export const mobileAuthApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse, LoginRequest>('/auth/login', credentials);
    const accessToken = response.accessToken || response.token;
    if (accessToken) {
      await tokenStorage.setTokens(accessToken, response.refreshToken || accessToken);
    }
    if (response.user) {
      await tokenStorage.setUser(response.user);
    }
    return response;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse, { refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    const accessToken = response.accessToken || response.token;
    if (accessToken) {
      await tokenStorage.updateAccessToken(accessToken, response.refreshToken || refreshToken);
    }
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        await api.post('/auth/logout', {}).catch(() => { });
      }
    } finally {
      await tokenStorage.clearSession();
      notifyUnauthorized();
    }
  },

  getMe: (): Promise<AuthUser> => api.get<AuthUser>('/auth/me'),
};

export const mobileInspectionsApi = {
  list: (technicianId?: string): Promise<Inspection[]> => {
    const query = technicianId ? `?technicianId=${technicianId}` : '';
    return api.get<Inspection[]>(`/mobile/inspections${query}`);
  },
  getById: (id: string): Promise<Inspection> => api.get<Inspection>(`/inspections/${id}`),
  submitAnswers: (id: string, payload: SubmitInspectionAnswersRequest): Promise<Inspection> =>
    api.post<Inspection>(`/inspections/${id}/submit`, payload),
  saveAnswer: (
    id: string,
    answer: {
      questionId: string;
      value: string;
      observation?: string;
      photoUrl?: string;
      signatureUrl?: string;
    }
  ): Promise<unknown> => api.post(`/inspections/${id}/answers`, answer),
  complete: (id: string, observation?: string): Promise<Inspection> =>
    api.patch<Inspection>(`/inspections/${id}/complete`, { observation }),
};

export const mobileEquipmentApi = {
  list: (): Promise<Equipment[]> => api.get<Equipment[]>('/equipments'),
  getById: (id: string): Promise<Equipment> => api.get<Equipment>(`/equipments/${id}`),
  getByQrCode: (qrCode: string): Promise<Equipment> =>
    api.get<Equipment>(`/equipment/by-qr/${encodeURIComponent(qrCode)}`),
  updateStatus: (id: string, status: EquipmentStatus): Promise<Equipment> =>
    api.patch<Equipment>(`/equipments/${id}`, { status }),
};

export const mobileDashboardApi = {
  getSummary: (): Promise<DashboardSummary> => api.get<DashboardSummary>('/dashboard/summary'),
};
