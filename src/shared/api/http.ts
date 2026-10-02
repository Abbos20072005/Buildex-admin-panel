import { env } from "@/shared/config/env";
import { ApiError, extractErrorMessage } from "./errors";
import { session } from "./session";
import { extractTokens } from "./tokens";

/** All admin endpoints live under this prefix (Dommaster Admin API). */
const ADMIN_PREFIX = "/api/v1/admin";
const REFRESH_PATH = "/auth/token/refresh/";

/** Fired when the session can't be restored — the auth provider logs the user out. */
export const UNAUTHORIZED_EVENT = "buildex:unauthorized";

export type QueryValue = string | number | boolean | null | undefined | (string | number)[];
export type Query = Record<string, QueryValue>;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  query?: Query;
  body?: unknown;
  /** retry once with a refreshed token on 401 (default: true) */
  retryOnUnauthorized?: boolean;
}

export function buildQuery(query?: Query): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) value.forEach((item) => params.append(key, String(item)));
    else params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Some endpoints wrap payloads as { result, ok: true }. */
function unwrap(body: unknown): unknown {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const record = body as Record<string, unknown>;
    if (record.ok === true && "result" in record) return record.result;
  }
  return body;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* ---------- token refresh (single flight) ---------- */

let refreshInFlight: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  const refresh = session.refreshToken;
  if (!refresh) return Promise.resolve(false);

  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${env.apiUrl}${ADMIN_PREFIX}${REFRESH_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) return false;
      const tokens = extractTokens(await parseBody(response));
      if (!tokens.access) return false;
      session.setTokens(tokens.access, tokens.refresh);
      return true;
    } catch {
      return false;
    } finally {
      queueMicrotask(() => (refreshInFlight = null));
    }
  })();

  return refreshInFlight;
}

/* ---------- request ---------- */

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, body, retryOnUnauthorized = true, headers: initHeaders, ...init } = options;

  const isFormData = body instanceof FormData;
  const headers = new Headers(initHeaders);
  headers.set("Accept", "application/json");
  // translated fields (`name`, category/brand names…) come back in the admin UI language
  headers.set("Accept-Language", document.documentElement.lang || "uz");
  // FormData sets its own multipart boundary
  if (body !== undefined && !isFormData) headers.set("Content-Type", "application/json");
  const token = session.accessToken;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${ADMIN_PREFIX}${path}${buildQuery(query)}`, {
      ...init,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "network");
  }

  if (response.status === 401 && token && retryOnUnauthorized) {
    if (await refreshTokens()) return http<T>(path, { ...options, retryOnUnauthorized: false });
    session.clear();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  const payload = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(payload, response.statusText), payload);
  }
  return unwrap(payload) as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => http<T>(path, { query }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    http<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown) => http<T>(path, { method: "PUT", body }),
  /** JSON, or multipart/form-data when `body` is a FormData (files) */
  patch: <T>(path: string, body?: unknown) => http<T>(path, { method: "PATCH", body }),
  /** multipart/form-data upload (files) */
  upload: <T>(path: string, form: FormData) => http<T>(path, { method: "POST", body: form }),
  delete: <T = void>(path: string) => http<T>(path, { method: "DELETE" }),
};
