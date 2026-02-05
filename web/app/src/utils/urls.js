/**
 * Base URL of the current origin (for scripts, certs, docs, docker).
 * Safe for SSR (returns empty string when window is undefined).
 */
export function getBaseUrl() {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

/**
 * Registry URL for push/pull (host:5000). Uses current hostname.
 */
export function getRegistryUrl() {
  if (typeof window === 'undefined') return 'https://localhost:5000';
  return `https://${window.location.hostname}:5000`;
}

/**
 * Base URL for curl examples (http so copy-paste works without TLS issues on first setup).
 */
export function getCurlBaseUrl() {
  const base = getBaseUrl();
  if (!base) return 'http://HOST:9000';
  return base.replace(/^https?:/, 'http:');
}
