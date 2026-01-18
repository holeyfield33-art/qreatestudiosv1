/**
 * Type-safe fetch wrapper with built-in error handling
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FetchResult<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Safe fetch with timeout and retries
 */
export async function safeFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  const {
    timeout = 30000,
    retries = 0,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse JSON response
      let data: T | undefined;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        data = json.data || json;
      }

      if (!response.ok) {
        const error = typeof data === 'object' && data !== null && 'error' in data
          ? String((data as { error?: unknown }).error || `Request failed with status ${response.status}`)
          : `Request failed with status ${response.status}`;

        return {
          error,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on abort
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          error: 'Request timeout',
          status: 408,
        };
      }

      // Wait before retry
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  return {
    error: lastError?.message || 'Network request failed',
    status: 0,
  };
}

/**
 * Simplified API client methods
 */
export const apiClient = {
  async get<T>(url: string, options?: FetchOptions): Promise<FetchResult<T>> {
    return safeFetch<T>(url, { ...options, method: 'GET' });
  },

  async post<T>(url: string, data?: unknown, options?: FetchOptions): Promise<FetchResult<T>> {
    return safeFetch<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch<T>(url: string, data?: unknown, options?: FetchOptions): Promise<FetchResult<T>> {
    return safeFetch<T>(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete<T>(url: string, options?: FetchOptions): Promise<FetchResult<T>> {
    return safeFetch<T>(url, { ...options, method: 'DELETE' });
  },
};

/**
 * Usage Example:
 * 
 * const { data, error } = await apiClient.get('/api/qr');
 * if (error) {
 *   toast.error(error);
 *   return;
 * }
 * setData(data);
 */
