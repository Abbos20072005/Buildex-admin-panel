const DEFAULT_API_URL = "https://api.buildex.uz";

export const env = {
  /**
   * Base URL of the backend. Empty in dev: requests go to the Vite proxy
   * (`/api` → VITE_API_URL, see vite.config.ts), so there are no CORS issues locally.
   */
  apiUrl: import.meta.env.DEV
    ? ""
    : (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, ""),
} as const;
