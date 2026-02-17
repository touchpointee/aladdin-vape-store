// Build-time default from env only (used until runtime config is loaded, and as fallback when all bootstrap URLs fail)
const BUILD_TIME_DEFAULT = process.env.EXPO_PUBLIC_API_URL ?? '';

// Optional: comma-separated list of URLs to try for config (e.g. backup if primary is blocked)
// Example: EXPO_PUBLIC_APP_CONFIG_URLS=https://aladdinvapestoreindia.net,https://aladdinstorestest.com,https://aladdinstore2026test.com
const BOOTSTRAP_URLS: string[] = process.env.EXPO_PUBLIC_APP_CONFIG_URLS
  ? process.env.EXPO_PUBLIC_APP_CONFIG_URLS.split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean)
  : BUILD_TIME_DEFAULT ? [BUILD_TIME_DEFAULT] : [];

// Set by loadApiConfig() so backend URL can change without app update
let runtimeBaseUrl: string | null = null;

export function getApiBaseUrl(): string {
  const base = runtimeBaseUrl ?? BUILD_TIME_DEFAULT;
  return base.replace(/\/$/, '');
}

/** Call on app startup. Tries each bootstrap URL until one returns config; all API calls then use that. */
export async function loadApiConfig(timeoutMs = 5000): Promise<void> {
  for (const base of BOOTSTRAP_URLS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), Math.min(timeoutMs, 4000));
    try {
      const res = await fetch(`${base}/api/app-config`, { signal: controller.signal });
      const data = (await res.json().catch(() => ({}))) || {};
      if (res.ok) {
        const fromServer = data?.apiBaseUrl && typeof data.apiBaseUrl === 'string' ? data.apiBaseUrl.trim() : '';
        runtimeBaseUrl = fromServer ? fromServer.replace(/\/$/, '') : base.replace(/\/$/, '');
        clearTimeout(id);
        return;
      }
    } catch (_) {
      // try next URL
    } finally {
      clearTimeout(id);
    }
  }
  // keep build-time default if all fail
}

export function apiUrl(path: string, params?: Record<string, string>): string {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!params || Object.keys(params).length === 0) return `${base}${p}`;
  const search = new URLSearchParams(params).toString();
  return `${base}${p}?${search}`;
}
