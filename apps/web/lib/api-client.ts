import { getSupabaseClient } from './supabase';

function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new Error('API is not configured. Set NEXT_PUBLIC_API_URL to your backend URL.');
  }

  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const normalizedUrl = /^https?:\/\//i.test(configuredUrl)
    ? configuredUrl
    : `${protocol}://${configuredUrl.replace(/^\/+/, '')}`;

  try {
    const baseUrl = new URL(normalizedUrl);

    if (!['http:', 'https:'].includes(baseUrl.protocol) || !baseUrl.hostname) {
      throw new Error();
    }

    if (baseUrl.search || baseUrl.hash) {
      throw new Error();
    }

    return baseUrl;
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL must be a valid HTTP(S) backend URL, such as http://localhost:3001.');
  }
}

function getApiRequestUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  const basePath = baseUrl.pathname.replace(/\/+$/, '');
  const endpoint = path.trim().replace(/^\/+/, '');
  const relativePath = basePath ? `${basePath}/${endpoint}` : endpoint;
  const requestUrl = new URL(relativePath, baseUrl.origin);

  if (requestUrl.origin !== baseUrl.origin) {
    throw new Error('API requests must use the configured API origin.');
  }

  return requestUrl;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const requestUrl = getApiRequestUrl(path);

  const { data, error } = await getSupabaseClient().auth.getSession();

  if (error) {
    throw error;
  }

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error('You must be signed in to make API requests.');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(requestUrl, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message ?? `API request failed with status ${response.status}.`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}