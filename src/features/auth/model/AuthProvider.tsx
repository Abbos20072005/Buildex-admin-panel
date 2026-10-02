import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { UNAUTHORIZED_EVENT } from "@/shared/api";
import { authApi } from "../api/auth.api";
import { AuthContext } from "./auth-context";
import type { AdminUser, LoginCredentials } from "./types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AdminUser | null>(authApi.cachedUser);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    setUser(await authApi.login(credentials));
  }, []);

  const signOut = useCallback(() => {
    authApi.logout();
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  // Re-validate a stored session on start (an expired token is refreshed or the user is logged out).
  useEffect(() => {
    if (!authApi.cachedUser()) return;
    authApi.me().then(setUser, () => {
      /* 401 → UNAUTHORIZED_EVENT below; network errors keep the cached profile */
    });
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      queryClient.clear();
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [queryClient]);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
