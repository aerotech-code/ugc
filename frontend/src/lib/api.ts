// API Service Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestConfig<T = unknown> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: T;
}

// Get auth token
const getAuthToken = (): string | null => {
  const auth = localStorage.getItem('auth-storage');
  if (!auth) return null;
  try {
    const parsed = JSON.parse(auth);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
};

// Make API request
export async function apiRequest<T>(
  endpoint: string,
  config: Partial<RequestConfig<unknown>> = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: config.method || 'GET',
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    // read as text first so we can handle non-json errors (429 returns plain text)
    const text = await response.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      const errMsg =
        (parsed && (parsed.error || parsed.message)) ||
        text ||
        'An error occurred';
      return {
        success: false,
        error: errMsg,
      };
    }

    const resultData = parsed ? (parsed.data || parsed) : text;
    return {
      success: true,
      data: resultData,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// GET request helper
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

// POST request helper
export async function apiPost<T, B = unknown>(
  endpoint: string,
  body: B
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'POST', body });
}

// PUT request helper
export async function apiPut<T, B = unknown>(
  endpoint: string,
  body: B
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'PUT', body });
}

// DELETE request helper
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

// PATCH request helper
export async function apiPatch<T, B = unknown>(
  endpoint: string,
  body: B
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'PATCH', body });
}

// Generic apiCall function for flexible method calls
export async function apiCall<T = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method, body });
}

