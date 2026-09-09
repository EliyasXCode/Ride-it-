import { ApiResponse } from '@rideflow/shared';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensure HttpOnly cookies are passed
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: { code: 'HTTP_ERROR', message: `Server returned ${response.status}: ${response.statusText}` },
  }));

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.message || 'Something went wrong',
      data.error?.code || `HTTP_${response.status}`,
      data.error?.details
    );
  }

  return data.data as T;
}
