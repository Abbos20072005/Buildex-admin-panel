import { createContext, useContext } from "react";
import type { AdminUser, LoginCredentials } from "./types";

export interface AuthContextValue {
  user: AdminUser | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
