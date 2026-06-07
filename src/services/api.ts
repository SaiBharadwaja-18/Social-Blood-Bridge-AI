const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RequestConfig {
  method: string;
  url: string;
  data?: unknown;
  params?: Record<string, string>;
}

async function request<T>(config: RequestConfig): Promise<T> {
  const { method, url, data, params } = config;

  // Attach auth token
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const qs = params ? '?' + new URLSearchParams(params).toString() : '';

  const response = await fetch(`${API_BASE_URL}${url}${qs}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  // Handle 401 globally
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get:    <T>(url: string, params?: Record<string, string>) =>
            request<T>({ method: 'GET', url, params }),
  post:   <T>(url: string, data?: unknown) =>
            request<T>({ method: 'POST', url, data }),
  put:    <T>(url: string, data?: unknown) =>
            request<T>({ method: 'PUT', url, data }),
  delete: <T>(url: string) =>
            request<T>({ method: 'DELETE', url }),
};