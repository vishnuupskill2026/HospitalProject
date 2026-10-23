interface ClinicRuntimeConfig {
  apiBaseUrl?: string;
}

declare global {
  interface Window {
    __CLINIC_CONFIG__?: ClinicRuntimeConfig;
  }
}

export function apiUrl(path: string): string {
  const baseUrl = window.__CLINIC_CONFIG__?.apiBaseUrl?.replace(/\/$/, '') ?? '';
  return `${baseUrl}${path}`;
}