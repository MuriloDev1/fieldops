/**
 * FieldOps Web - Cliente HTTP Tipado, Interceptores e Renovação JWT
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
import { authService, AUTH_STORAGE_KEYS, API_BASE_URL } from './authService';
import type {
  ApiErrorResponse,
  LoginRequest,
  LoginResponse,
  Client,
  CreateClientRequest,
  InspectionSite,
  CreateSiteRequest,
  Equipment,
  CreateEquipmentRequest,
  EquipmentStatus,
  Inspection,
  CreateInspectionRequest,
  SubmitInspectionAnswersRequest,
  InspectionTemplate,
  CreateTemplateRequest,
  NonConformity,
  CreateNonConformityRequest,
  InspectionReview,
  DashboardSummary,
  AuthUser,
  CreateUserRequest,
  UserStatus,
} from '../types/api';

// Interface para controle de concorrência na fila de requisições pendentes de refresh
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
 * Instância principal configurada do Axios
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
// 1. Request Interceptor
// ==========================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = authService.getStoredAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // RN-007: Sanitização estrita - nunca logar Authorization headers ou tokens
    return config;
  },
  (error: unknown): Promise<never> => {
    return Promise.reject(error);
  }
);

// ==========================================
// 2. Response Interceptor
// ==========================================
interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>): Promise<AxiosResponse> => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;

    // Tratamento de 403 Forbidden: Controle centralizado de acesso RBAC
    if (status === 403) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('fieldops:forbidden', {
            detail: {
              path: originalRequest?.url,
              message: 'Acesso não autorizado para seu perfil de usuário (403 Forbidden).',
            },
          })
        );
      }
      return Promise.reject(error);
    }

    // Tratamento de 401 Unauthorized
    if (status === 401) {
      if (!originalRequest) {
        return Promise.reject(error);
      }

      const url = originalRequest.url || '';
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh');

      // Se o erro 401 veio da própria rota de autenticação ou de refresh, invalida sessão imediatamente
      if (isAuthRoute) {
        authService.clearSession();
        authService.emitSessionExpired();
        return Promise.reject(error);
      }

      // Se a requisição já sofreu retry e falhou com 401 novamente, encerra sessão
      if (originalRequest._retry) {
        authService.clearSession();
        authService.emitSessionExpired();
        return Promise.reject(error);
      }

      // Bloqueio de chamadas concorrentes: se já houver um refresh em andamento, enfileira
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

      // Inicia processo exclusivo de renovação
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authService.getStoredRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        authService.clearSession();
        authService.emitSessionExpired();
        return Promise.reject(error);
      }

      try {
        // Chamada direta para o endpoint de refresh sem reentrar no interceptor
        const response = await axios.post<{
          token?: string;
          accessToken?: string;
          refreshToken?: string;
        }>(
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
          throw new Error('Servidor não retornou um token de acesso válido.');
        }

        // Persiste as novas credenciais
        authService.updateTokens(newAccessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Libera e repete as requisições que estavam enfileiradas
        processQueue(null, newAccessToken);

        // Repete a requisição original com o novo token
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        authService.clearSession();
        authService.emitSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================
// 3. Cliente Wrapper Tipado (Métodos Convenientes)
// ==========================================
export const api = {
  get: <T = unknown>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get<T>(endpoint, config).then((res) => res.data),

  post: <T = unknown, B = unknown>(endpoint: string, body?: B, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post<T>(endpoint, body, config).then((res) => res.data),

  put: <T = unknown, B = unknown>(endpoint: string, body?: B, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put<T>(endpoint, body, config).then((res) => res.data),

  patch: <T = unknown, B = unknown>(endpoint: string, body?: B, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch<T>(endpoint, body, config).then((res) => res.data),

  delete: <T = unknown>(endpoint: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete<T>(endpoint, config).then((res) => res.data),
};

// ==========================================
// 4. Módulos Específicos de Serviço da API
// ==========================================

export const authApi = {
  login: (email: string, password: string): Promise<LoginResponse> =>
    api.post<LoginResponse, LoginRequest>('/auth/login', { email, password }),
  refreshToken: (refreshToken: string) =>
    authService.refreshToken(refreshToken),
  logout: () => authService.logout(),
  getMe: (): Promise<AuthUser> => api.get<AuthUser>('/auth/me'),
};

export const clientsApi = {
  getAll: (): Promise<Client[]> => api.get<Client[]>('/clients'),
  getById: (id: string): Promise<Client> => api.get<Client>(`/clients/${id}`),
  create: (clientData: CreateClientRequest): Promise<Client> => api.post<Client>('/clients', clientData),
  updateStatus: (id: string, status: string): Promise<Client> =>
    api.patch<Client>(`/clients/${id}/status`, { status }),
};

export const sitesApi = {
  getAll: (): Promise<InspectionSite[]> => api.get<InspectionSite[]>('/sites'),
  getById: (id: string): Promise<InspectionSite> => api.get<InspectionSite>(`/sites/${id}`),
  getByClient: (clientId: string): Promise<InspectionSite[]> =>
    api.get<InspectionSite[]>(`/clients/${clientId}/sites`),
  create: (siteData: CreateSiteRequest): Promise<InspectionSite> => api.post<InspectionSite>('/sites', siteData),
};

export const equipmentApi = {
  getAll: (params: { clientId?: string; siteId?: string } = {}): Promise<Equipment[]> => {
    const query = new URLSearchParams();
    if (params.clientId) query.append('clientId', params.clientId);
    if (params.siteId) query.append('siteId', params.siteId);
    const queryString = query.toString();
    return api.get<Equipment[]>(`/equipment${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id: string): Promise<Equipment> => api.get<Equipment>(`/equipment/${id}`),
  getByQrCode: (qrCode: string): Promise<Equipment> =>
    api.get<Equipment>(`/equipment/by-qr/${encodeURIComponent(qrCode)}`),
  create: (equipmentData: CreateEquipmentRequest): Promise<Equipment> =>
    api.post<Equipment>('/equipment', equipmentData),
  updateStatus: (id: string, status: EquipmentStatus): Promise<Equipment> =>
    api.patch<Equipment>(`/equipment/${id}/status`, { status }),
};

export const dashboardApi = {
  getSummary: (): Promise<DashboardSummary> => api.get<DashboardSummary>('/dashboard/summary'),
};

export const inspectionsApi = {
  getAll: (): Promise<Inspection[]> => api.get<Inspection[]>('/inspections'),
  getById: (id: string): Promise<Inspection> => api.get<Inspection>(`/inspections/${id}`),
  getHistory: (id: string): Promise<unknown> => api.get(`/inspections/${id}/history`),
  listForMobile: (technicianId?: string): Promise<Inspection[]> => {
    const query = technicianId ? `?technicianId=${technicianId}` : '';
    return api.get<Inspection[]>(`/mobile/inspections${query}`);
  },
  create: (inspectionData: CreateInspectionRequest): Promise<Inspection> =>
    api.post<Inspection>('/inspections', inspectionData),
  start: (id: string, deviceTime?: string): Promise<Inspection> =>
    api.post<Inspection>(`/inspections/${id}/start`, deviceTime ? { deviceTime } : {}),
  submit: (id: string, payload: SubmitInspectionAnswersRequest): Promise<Inspection> =>
    api.post<Inspection>(`/inspections/${id}/submit`, payload),
  cancel: (id: string, reason: string): Promise<Inspection> =>
    api.post<Inspection>(`/inspections/${id}/cancel`, { reason }),
};

export const templatesApi = {
  getAll: (): Promise<InspectionTemplate[]> => api.get<InspectionTemplate[]>('/inspection-templates'),
  getById: (id: string): Promise<InspectionTemplate> =>
    api.get<InspectionTemplate>(`/inspection-templates/${id}`),
  getActiveVersion: (id: string): Promise<unknown> =>
    api.get(`/inspection-templates/${id}/active-version`),
  getVersionById: (versionId: string): Promise<unknown> =>
    api.get(`/inspection-template-versions/${versionId}`),
  create: (templateData: CreateTemplateRequest): Promise<InspectionTemplate> =>
    api.post<InspectionTemplate>('/inspection-templates', templateData),
  publish: (id: string, payload?: Record<string, unknown>): Promise<unknown> =>
    api.post(`/inspection-templates/${id}/publish`, payload || {}),
};

export const nonConformitiesApi = {
  getAll: (): Promise<NonConformity[]> => api.get<NonConformity[]>('/non-conformities'),
  getById: (id: string): Promise<NonConformity> =>
    api.get<NonConformity>(`/non-conformities/${id}`),
  getByInspection: (inspectionId: string): Promise<NonConformity[]> =>
    api.get<NonConformity[]>(`/inspections/${inspectionId}/non-conformities`),
  create: (inspectionId: string, ncData: CreateNonConformityRequest): Promise<NonConformity> =>
    api.post<NonConformity>(`/inspections/${inspectionId}/non-conformities`, ncData),
  updateStatus: (id: string, status: string): Promise<NonConformity> =>
    api.patch<NonConformity>(`/non-conformities/${id}/status`, { status }),
};

export const reviewsApi = {
  getByInspection: (inspectionId: string): Promise<InspectionReview[]> =>
    api.get<InspectionReview[]>(`/inspections/${inspectionId}/reviews`),
  beginReview: (inspectionId: string): Promise<unknown> =>
    api.post(`/inspections/${inspectionId}/begin-review`, {}),
  approve: (inspectionId: string, comments?: string): Promise<unknown> =>
    api.post(`/inspections/${inspectionId}/approve`, { decision: 'APPROVED', comments }),
  reject: (inspectionId: string, reason?: string): Promise<unknown> =>
    api.post(`/inspections/${inspectionId}/reject`, { decision: 'REJECTED', reason }),
};

export const usersApi = {
  getAll: (): Promise<AuthUser[]> => api.get<AuthUser[]>('/users'),
  getById: (id: string): Promise<AuthUser> => api.get<AuthUser>(`/users/${id}`),
  create: (userData: CreateUserRequest): Promise<AuthUser> =>
    api.post<AuthUser>('/users', userData),
  updateStatus: (id: string, status: UserStatus): Promise<AuthUser> =>
    api.patch<AuthUser>(`/users/${id}/status`, { status }),
};

export const mobileSyncApi = {
  pull: <T = unknown>(lastPulledAt?: string): Promise<T> => {
    const query = lastPulledAt ? `?lastPulledAt=${encodeURIComponent(lastPulledAt)}` : '';
    return api.get<T>(`/mobile/sync/pull${query}`);
  },
  push: <T = unknown>(payload: unknown): Promise<T> =>
    api.post<T>('/mobile/sync/push', payload),
};

export { authService, AUTH_STORAGE_KEYS, API_BASE_URL };
