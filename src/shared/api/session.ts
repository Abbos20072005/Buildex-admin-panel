/** Persists JWT tokens and the cached profile in localStorage (safe in private mode). */

const KEYS = {
  access: "buildex_admin_access",
  refresh: "buildex_admin_refresh",
  user: "buildex_admin_user",
} as const;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — keep the session in memory only */
  }
}

export const session = {
  get accessToken() {
    return read(KEYS.access);
  },

  get refreshToken() {
    return read(KEYS.refresh);
  },

  setTokens(access: string, refresh?: string | null) {
    write(KEYS.access, access);
    if (refresh) write(KEYS.refresh, refresh);
  },

  getCached<T>(): T | null {
    const raw = read(KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setCached<T>(value: T) {
    write(KEYS.user, JSON.stringify(value));
  },

  clear() {
    Object.values(KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });
  },
};
