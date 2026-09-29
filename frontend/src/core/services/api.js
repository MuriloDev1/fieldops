const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = localStorage.getItem('fieldops_token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP ${response.status}: Falha na requisição`);
      error.status = response.status;
      error.code = data?.code;
      error.fieldErrors = data?.fieldErrors;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// Módulos de serviço da API FieldOps
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (clientData) => api.post('/clients', clientData),
  updateStatus: (id, status) => api.patch(`/clients/${id}/status`, { status }),
};

export const sitesApi = {
  getAll: () => api.get('/sites'),
  getById: (id) => api.get(`/sites/${id}`),
  getByClient: (clientId) => api.get(`/clients/${clientId}/sites`),
  create: (siteData) => api.post('/sites', siteData),
};

export const equipmentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.clientId) query.append('clientId', params.clientId);
    if (params.siteId) query.append('siteId', params.siteId);
    const queryString = query.toString();
    return api.get(`/equipment${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/equipment/${id}`),
  getByQrCode: (qrCode) => api.get(`/equipment/by-qr/${encodeURIComponent(qrCode)}`),
  create: (equipmentData) => api.post('/equipment', equipmentData),
  updateStatus: (id, status) => api.patch(`/equipment/${id}/status`, { status }),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const inspectionsApi = {
  getAll: () => api.get('/inspections'),
  getById: (id) => api.get(`/inspections/${id}`),
  listForMobile: (technicianId) => {
    const query = technicianId ? `?technicianId=${technicianId}` : '';
    return api.get(`/mobile/inspections${query}`);
  },
  create: (inspectionData) => api.post('/inspections', inspectionData),
  start: (id, deviceTime) => api.post(`/inspections/${id}/start`, deviceTime ? { deviceTime } : {}),
  submit: (id, answers) => api.post(`/inspections/${id}/submit`, { answers }),
  cancel: (id, reason) => api.post(`/inspections/${id}/cancel`, { reason }),
};

export const templatesApi = {
  getAll: () => api.get('/inspection-templates'),
  getById: (id) => api.get(`/inspection-templates/${id}`),
  getActiveVersion: (id) => api.get(`/inspection-templates/${id}/active-version`),
  getVersionById: (versionId) => api.get(`/inspection-template-versions/${versionId}`),
  create: (templateData) => api.post('/inspection-templates', templateData),
  publish: (id, payload) => api.post(`/inspection-templates/${id}/publish`, payload || {}),
};

export const nonConformitiesApi = {
  getAll: () => api.get('/non-conformities'),
  getById: (id) => api.get(`/non-conformities/${id}`),
  getByInspection: (inspectionId) => api.get(`/inspections/${inspectionId}/non-conformities`),
  create: (inspectionId, ncData) => api.post(`/inspections/${inspectionId}/non-conformities`, ncData),
  updateStatus: (id, status) => api.patch(`/non-conformities/${id}/status`, { status }),
};

export const reviewsApi = {
  getByInspection: (inspectionId) => api.get(`/inspections/${inspectionId}/reviews`),
  beginReview: (inspectionId) => api.post(`/inspections/${inspectionId}/begin-review`, {}),
  approve: (inspectionId, comments) => api.post(`/inspections/${inspectionId}/approve`, { decision: 'APPROVED', comments }),
  reject: (inspectionId, reason) => api.post(`/inspections/${inspectionId}/reject`, { decision: 'REJECTED', reason }),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
};

export const mobileSyncApi = {
  pull: (lastPulledAt) => {
    const query = lastPulledAt ? `?lastPulledAt=${encodeURIComponent(lastPulledAt)}` : '';
    return api.get(`/mobile/sync/pull${query}`);
  },
  push: (payload) => api.post('/mobile/sync/push', payload),
};
