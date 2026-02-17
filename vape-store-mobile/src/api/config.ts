// Build-time default from env only (used until runtime config is loaded, and as fallback when all bootstrap URLs fail)
const BUILD_TIME_DEFAULT = process.env.EXPO_PUBLIC_API_URL ?? '';

// Optional: comma-separated list of fallback URLs (tried only if default fails). Default is always tried first.
const FALLBACK_URLS: string[] = process.env.EXPO_PUBLIC_APP_CONFIG_URLS
  ? process.env.EXPO_PUBLIC_APP_CONFIG_URLS.split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean)
  : [];

// Default URL is tried first; fallbacks only if default fails. No duplicate entries.
const defaultNormalized = BUILD_TIME_DEFAULT ? BUILD_TIME_DEFAULT.replace(/\/+$/, '') : '';
const BOOTSTRAP_URLS: string[] = defaultNormalized
  ? [defaultNormalized, ...FALLBACK_URLS.filter((u) => u !== defaultNormalized)]
  : FALLBACK_URLS;

// Set by loadApiConfig() so backend URL can change without app update
let runtimeBaseUrl: string | null = null;

export function getApiBaseUrl(): string {
  const base = runtimeBaseUrl ?? BUILD_TIME_DEFAULT;
  const trimmed = (base || '').replace(/\/$/, '');
  if (!trimmed) return '';
  if (isLocalhostUrl(trimmed)) return (BUILD_TIME_DEFAULT || '').replace(/\/$/, '');
  return trimmed;
}

function isLocalhostUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return /^localhost$/i.test(u.hostname) || u.hostname === '127.0.0.1';
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

/** Call on app startup. Tries each bootstrap URL until one returns a valid (non-localhost) config. */
export async function loadApiConfig(timeoutMs = 5000): Promise<void> {
  runtimeBaseUrl = null;
  for (const base of BOOTSTRAP_URLS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), Math.min(timeoutMs, 4000));
    try {
      const res = await fetch(`${base}/api/app-config`, { signal: controller.signal });
      const data = (await res.json().catch(() => ({}))) || {};
      if (res.ok) {
        const fromServer = data?.apiBaseUrl && typeof data.apiBaseUrl === 'string' ? data.apiBaseUrl.trim() : '';
        const baseNormalized = base.replace(/\/$/, '');
        const resolved = fromServer ? fromServer.replace(/\/$/, '') : baseNormalized;
        if (resolved && !isLocalhostUrl(resolved)) {
          runtimeBaseUrl = resolved;
          clearTimeout(id);
          return;
        }
      }
    } catch (_) {
      // try next URL
    } finally {
      clearTimeout(id);
    }
  }
  runtimeBaseUrl = null;
}

export function apiUrl(path: string, params?: Record<string, string>): string {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!params || Object.keys(params).length === 0) return `${base}${p}`;
  const search = new URLSearchParams(params).toString();
  return `${base}${p}?${search}`;
}
