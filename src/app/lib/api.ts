const fallbackBaseUrl = (() => {
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }

  if (typeof window !== 'undefined' && window?.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:4000';
})();

export const apiBaseUrl = import.meta.env.VITE_API_URL || fallbackBaseUrl;

// Simple fetch wrapper to replace axios
class APIClient {
  constructor(private baseURL: string) {}

  private async request<T = any>(
    method: string,
    url: string,
    config?: { data?: any; headers?: any; params?: Record<string, string> }
  ): Promise<{ data: T; status: number }> {
    const baseURL = new URL(url, this.baseURL);
    if (config?.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        baseURL.searchParams.append(key, value);
      });
    }
    const fullURL = baseURL.toString();
    const response = await fetch(fullURL, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: config?.data ? JSON.stringify(config.data) : undefined,
      credentials: 'include',
    });

    const data = await response.json();
    return { data, status: response.status };
  }

  get<T = any>(url: string, config?: any) {
    return this.request<T>('GET', url, config);
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.request<T>('POST', url, { ...config, data });
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.request<T>('PUT', url, { ...config, data });
  }

  delete<T = any>(url: string, config?: any) {
    return this.request<T>('DELETE', url, config);
  }
}

export const api = new APIClient(apiBaseUrl);

export const apiRoutes = {
  session: '/api/auth/session',
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  dashboard: '/api/v1/dashboard',
  sync: '/api/v1/summaries/sync',
  wraps: '/api/v1/wraps',
  wrapSync: '/api/v1/wraps/sync',
};
