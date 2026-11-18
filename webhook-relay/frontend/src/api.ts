import type {
  ApiKey,
  Delivery,
  DeliveryDetail,
  Endpoint,
  EventSummary,
  Stats,
  User,
} from './types';

const BASE = import.meta.env.VITE_API_URL ?? '';
const TOKEN_KEY = 'relay.token';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token: string | null = getToken(),
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE}${path}`, { ...options, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item: { msg: string }) => item.msg).join(', ')
      : (detail ?? `Request failed with ${response.status}`);
    throw new ApiError(response.status, message);
  }
  return body as T;
}

export const api = {
  async login(email: string, password: string) {
    return request<{ access_token: string; user: User }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      null,
    );
  },

  async register(email: string, password: string) {
    return request<{ access_token: string; user: User; api_key: string }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      null,
    );
  },

  me() {
    return request<User>('/api/auth/me');
  },

  stats() {
    return request<Stats>('/api/stats');
  },

  endpoints() {
    return request<Endpoint[]>('/api/endpoints');
  },

  createEndpoint(input: {
    url: string;
    description: string;
    event_types: string[];
  }) {
    return request<Endpoint>('/api/endpoints', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  updateEndpoint(id: string, input: Partial<Pick<Endpoint, 'is_active' | 'description'>>) {
    return request<Endpoint>(`/api/endpoints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  deleteEndpoint(id: string) {
    return request<void>(`/api/endpoints/${id}`, { method: 'DELETE' });
  },

  rotateSecret(id: string) {
    return request<Endpoint>(`/api/endpoints/${id}/rotate-secret`, {
      method: 'POST',
    });
  },

  testEndpoint(id: string) {
    return request<Endpoint>(`/api/endpoints/${id}/test`, { method: 'POST' });
  },

  events(limit = 20) {
    return request<EventSummary[]>(`/api/events?limit=${limit}`);
  },

  sendEvent(type: string, payload: Record<string, unknown>) {
    return request<EventSummary>('/api/events', {
      method: 'POST',
      body: JSON.stringify({ type, payload }),
    });
  },

  deliveries(status?: string) {
    const query = status ? `?status=${status}` : '';
    return request<Delivery[]>(`/api/deliveries${query}`);
  },

  delivery(id: string) {
    return request<DeliveryDetail>(`/api/deliveries/${id}`);
  },

  replay(id: string) {
    return request<DeliveryDetail>(`/api/deliveries/${id}/replay`, {
      method: 'POST',
    });
  },

  keys() {
    return request<ApiKey[]>('/api/keys');
  },

  createKey(name: string) {
    return request<ApiKey & { key: string }>('/api/keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  revokeKey(id: string) {
    return request<void>(`/api/keys/${id}`, { method: 'DELETE' });
  },
};
