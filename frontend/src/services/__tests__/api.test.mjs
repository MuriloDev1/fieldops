import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';

// Mock localStorage e window
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};

const events = [];
globalThis.window = {
  location: { pathname: '/dashboard', href: '/dashboard' },
  dispatchEvent: (event) => events.push(event),
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, detail) {
    this.type = type;
    this.detail = detail;
  }
};

describe('Cliente HTTP Tipado & Renovação JWT (Web)', () => {
  beforeEach(() => {
    localStorage.clear();
    events.length = 0;
  });

  test('Configura baseURL e headers padrão', async () => {
    const { apiClient } = await import('../api.ts');
    assert.ok(apiClient.defaults.baseURL.includes('/api/v1') || apiClient.defaults.baseURL.includes('localhost'));
    assert.equal(apiClient.defaults.headers['Content-Type'], 'application/json');
    assert.equal(apiClient.defaults.headers['Accept'], 'application/json');
  });

  test('Request Interceptor injeta header Authorization se token presente', async () => {
    const { apiClient } = await import('../api.ts');
    localStorage.setItem('fieldops_token', 'valid_access_token_123');

    const requestInterceptor = apiClient.interceptors.request.handlers[0];
    const config = { headers: {} };
    const result = await requestInterceptor.fulfilled(config);

    assert.equal(result.headers.Authorization, 'Bearer valid_access_token_123');
  });

  test('Request Interceptor não injeta Authorization se token ausente', async () => {
    const { apiClient } = await import('../api.ts');
    localStorage.removeItem('fieldops_token');

    const requestInterceptor = apiClient.interceptors.request.handlers[0];
    const config = { headers: {} };
    const result = await requestInterceptor.fulfilled(config);

    assert.equal(result.headers.Authorization, undefined);
  });

  test('Response Interceptor trata 403 Forbidden centralizadamente', async () => {
    const { apiClient } = await import('../api.ts');
    const responseInterceptor = apiClient.interceptors.response.handlers[0];

    const error403 = {
      config: { url: '/api/v1/admin/users' },
      response: { status: 403, data: { message: 'Acesso negado' } },
    };

    await assert.rejects(
      async () => responseInterceptor.rejected(error403),
      (err) => err.response.status === 403
    );

    const forbiddenEvent = events.find((e) => e.type === 'fieldops:forbidden');
    assert.ok(forbiddenEvent, 'Evento fieldops:forbidden deve ser emitido');
  });

  test('Response Interceptor: 401 em rota de login limpa sessão e redireciona', async () => {
    const { apiClient } = await import('../api.ts');
    localStorage.setItem('fieldops_token', 'old_token');
    localStorage.setItem('fieldops_refresh_token', 'old_refresh');

    const responseInterceptor = apiClient.interceptors.response.handlers[0];
    const error401Login = {
      config: { url: '/auth/login' },
      response: { status: 401, data: { message: 'Credenciais inválidas' } },
    };

    await assert.rejects(
      async () => responseInterceptor.rejected(error401Login),
      (err) => err.response.status === 401
    );

    assert.equal(localStorage.getItem('fieldops_token'), null, 'Token de acesso deve ser removido');
    assert.equal(localStorage.getItem('fieldops_refresh_token'), null, 'Refresh token deve ser removido');
    assert.ok(events.some((e) => e.type === 'fieldops:session-expired'), 'Deve emitir session-expired');
  });

  test('Response Interceptor: fila e bloqueio de múltiplos 401s simultâneos', async () => {
    const { apiClient } = await import('../api.ts');
    localStorage.setItem('fieldops_token', 'expired_token');
    localStorage.setItem('fieldops_refresh_token', 'valid_refresh_token');

    let refreshCalls = 0;
    const originalPost = axios.post;
    axios.post = async (url, data) => {
      if (url.includes('/auth/refresh')) {
        refreshCalls++;
        assert.equal(data.refreshToken, 'valid_refresh_token');
        return {
          data: {
            accessToken: 'new_fresh_token_999',
            refreshToken: 'new_refresh_token_999',
          },
        };
      }
      return originalPost(url, data);
    };

    // Mock do adapter do apiClient para não bater na rede real durante o retry
    const originalAdapter = apiClient.defaults.adapter;
    apiClient.defaults.adapter = async (config) => {
      assert.equal(config.headers.Authorization, 'Bearer new_fresh_token_999');
      return {
        data: { success: true, url: config.url },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    const responseInterceptor = apiClient.interceptors.response.handlers[0];

    const createFakeRequest = (id) => ({
      config: {
        url: `/api/v1/inspections/${id}`,
        headers: {},
      },
      response: { status: 401 },
    });

    try {
      // Dispara 3 chamadas concorrentes
      const results = await Promise.all([
        responseInterceptor.rejected(createFakeRequest(1)),
        responseInterceptor.rejected(createFakeRequest(2)),
        responseInterceptor.rejected(createFakeRequest(3)),
      ]);

      assert.equal(refreshCalls, 1, 'Deve realizar EXATAMENTE uma chamada de renovação (bloqueio de concorrência)');
      assert.equal(localStorage.getItem('fieldops_token'), 'new_fresh_token_999', 'Deve persistir novo token de acesso');
      assert.equal(localStorage.getItem('fieldops_refresh_token'), 'new_refresh_token_999', 'Deve persistir novo refresh token');
      assert.equal(results.length, 3);
      assert.equal(results[0].data.success, true);
      assert.equal(results[1].data.success, true);
      assert.equal(results[2].data.success, true);
    } finally {
      axios.post = originalPost;
      apiClient.defaults.adapter = originalAdapter;
    }
  });

  test('authService: login, refreshToken e logout sanitizados', async () => {
    const { authService } = await import('../authService.ts');
    const originalPost = axios.post;

    axios.post = async (url, data) => {
      if (url.includes('/auth/login')) {
        return {
          data: {
            accessToken: 'test_access_token',
            refreshToken: 'test_refresh_token',
            expiresIn: 3600,
            user: { id: 'user-1', name: 'Test User', email: 'test@fieldops.com', role: 'SUPERVISOR', status: 'ACTIVE' },
          },
        };
      }
      if (url.includes('/auth/refresh')) {
        return {
          data: {
            accessToken: 'refreshed_access_token',
            refreshToken: 'refreshed_refresh_token',
          },
        };
      }
      if (url.includes('/auth/logout')) {
        return { data: null };
      }
      return originalPost(url, data);
    };

    try {
      // Teste de Login
      const loginRes = await authService.login({ email: 'test@fieldops.com', password: 'secret' });
      assert.equal(loginRes.accessToken, 'test_access_token');
      assert.equal(authService.getStoredAccessToken(), 'test_access_token');
      assert.equal(authService.getStoredRefreshToken(), 'test_refresh_token');
      assert.equal(authService.getStoredUser()?.email, 'test@fieldops.com');
      assert.equal(authService.isAuthenticated(), true);

      // Teste de Refresh
      const refreshRes = await authService.refreshToken('test_refresh_token');
      assert.equal(refreshRes.accessToken, 'refreshed_access_token');
      assert.equal(authService.getStoredAccessToken(), 'refreshed_access_token');

      // Teste de Logout
      await authService.logout();
      assert.equal(authService.getStoredAccessToken(), null);
      assert.equal(authService.getStoredRefreshToken(), null);
      assert.equal(authService.getStoredUser(), null);
      assert.equal(authService.isAuthenticated(), false);
    } finally {
      axios.post = originalPost;
    }
  });
});
