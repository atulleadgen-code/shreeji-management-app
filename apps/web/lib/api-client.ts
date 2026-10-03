import { getSupabaseClient } from './supabase';

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL must be set.');
  }

  const baseUrl = new URL(apiUrl);
  const requestUrl = new URL(path.replace(/^\/+/, ''), `${baseUrl.toString().replace(/\/+$/, '')}/`);

  if (requestUrl.origin !== baseUrl.origin) {
    throw new Error('API requests must use the configured API origin.');
  }

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