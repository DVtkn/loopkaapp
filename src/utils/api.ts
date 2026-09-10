import { safeGetStorage } from './safeStorage';

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function apiFetch(resource: RequestInfo | URL, config?: RequestInit) {
  const token = safeGetStorage<string | null>('loop_auth_token', null);
  
  let targetResource: RequestInfo | URL = resource;
  if (typeof resource === 'string' && resource.startsWith('/api')) {
    targetResource = `${API_BASE}${resource}`;
  }

  if (token && typeof resource === 'string' && (resource.startsWith('/api') || (API_BASE && resource.startsWith(API_BASE)))) {
    config = config || {};
    const headers = new Headers(config.headers || {});
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    config.headers = headers;
  }
  
  return fetch(targetResource, config);
}
