// Backend URL from .env (EXPO_PUBLIC_API_URL)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function apiUrl(path: string, params?: Record<string, string>): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!params || Object.keys(params).length === 0) return `${base}${p}`;
  const search = new URLSearchParams(params).toString();
  return `${base}${p}?${search}`;
}
