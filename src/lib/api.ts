// Frontend API Client with automatic JWT attachment and token refresh
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  stats?: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = cleanBase.endsWith('/api') && cleanEndpoint.startsWith('/api/')
    ? `${cleanBase}${cleanEndpoint.replace(/^\/api/, '')}`
    : `${cleanBase}${cleanEndpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('sparkx_access_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const json = await response.json();

    // If token expired, attempt refresh
    if (response.status === 401 && json.code === 'TOKEN_EXPIRED') {
      const refreshToken = localStorage.getItem('sparkx_refresh_token');
      if (refreshToken) {
        const refreshEndpoint = cleanBase.endsWith('/api') ? `${cleanBase}/auth/refresh` : `${cleanBase}/api/auth/refresh`;
        const refreshRes = await fetch(refreshEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
        const refreshJson = await refreshRes.json();
        if (refreshJson.success && refreshJson.data?.accessToken) {
          localStorage.setItem('sparkx_access_token', refreshJson.data.accessToken);
          localStorage.setItem('sparkx_refresh_token', refreshJson.data.refreshToken);

          // Retry original request
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${refreshJson.data.accessToken}`
          };
          const retryRes = await fetch(url, { ...options, headers: retryHeaders });
          return await retryRes.json();
        }
      }
    }

    return json;
  } catch (error: any) {
    console.error(`[API Request Error ${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Network communication error'
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: { params?: Record<string, any>; headers?: HeadersInit }) => {
    let finalEndpoint = endpoint;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
      const queryStr = searchParams.toString();
      if (queryStr) {
        finalEndpoint += (endpoint.includes('?') ? '&' : '?') + queryStr;
      }
    }
    return apiRequest<T>(finalEndpoint, { method: 'GET', headers: options?.headers });
  },
  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    }),
  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    }),
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' })
};

export default api;
