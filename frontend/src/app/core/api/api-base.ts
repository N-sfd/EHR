import { environment } from '../../../environments/environment';

/**
 * Builds a full API URL that works with both proxy (empty apiUrl) and direct URLs.
 * 
 * @param path - API path starting with '/api/...'
 * @returns Full URL or relative path for proxy
 * 
 * Examples:
 * - api('/api/patients') -> '/api/patients' (when apiUrl is '')
 * - api('/api/patients') -> 'http://localhost:8087/api/patients' (when apiUrl is 'http://localhost:8087')
 */
export function api(path: string): string {
  const baseUrl = environment.apiUrl || '';
  
  // If baseUrl is empty, return relative path (for proxy)
  if (!baseUrl || baseUrl.trim() === '') {
    return path;
  }
  
  // Remove trailing slash from baseUrl and leading slash from path if baseUrl already has it
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
}

/**
 * Unwraps API response that may be in { ok: true, data: ... } format or direct payload.
 * 
 * @param response - API response (can be direct payload or { ok: boolean, data?: T } format)
 * @returns Unwrapped data (T or T[])
 * 
 * Examples:
 * - unwrap({ ok: true, data: [...] }) -> [...]
 * - unwrap([...]) -> [...]
 * - unwrap({ ok: true, data: {...} }) -> {...}
 * - unwrap({...}) -> {...}
 */
export function unwrap<T>(response: any): T {
  // If response has ok and data properties, extract data
  if (response && typeof response === 'object' && 'ok' in response && 'data' in response) {
    return response.data as T;
  }
  
  // Otherwise return response as-is
  return response as T;
}

