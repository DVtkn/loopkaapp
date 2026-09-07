import { safeGetStorage } from './safeStorage';

export async function apiFetch(resource: RequestInfo | URL, config?: RequestInit) {
  const token = safeGetStorage<string | null>('loop_auth_token', null);
  
  if (token && typeof resource === 'string' && resource.startsWith('/api/')) {
    config = config || {};
    const headers = new Headers(config.headers || {});
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    config.headers = headers;
  }
  
  return fetch(resource, config);
}
