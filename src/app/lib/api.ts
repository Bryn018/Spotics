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
      cache: 'no-store',
    });

    let parsed: any = null;
    const contentType = response.headers.get('content-type') || '';

    // 204/304 have no response body by definition.
    if (response.status !== 204 && response.status !== 304) {
      if (contentType.includes('application/json')) {
        try {
          parsed = await response.json();
        } catch {
          parsed = null;
        }
      } else {
        try {
          const text = await response.text();
          parsed = text ? { message: text } : null;
        } catch {
          parsed = null;
        }
      }
    }

    if (!response.ok) {
      const message =
        parsed?.error?.message ||
        parsed?.message ||
        `Request failed with status ${response.status}`;

      const error = new Error(message) as Error & { status?: number; data?: unknown };
      error.status = response.status;
      error.data = parsed;
      throw error;
    }

    return { data: parsed as T, status: response.status };
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
  dashboard: '/api/dashboard',
  analytics: '/api/analytics',
  export: '/api/export',
  sync: '/api/summaries/sync',
  activitiesSync: '/api/activities/sync',
  wraps: '/api/wraps',
  wrapSync: '/api/wraps/sync',
  nowPlaying: '/api/now-playing',
};
