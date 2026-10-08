import { createContext, useContext } from "react";
import type { AdminUser, ChangePasswordInput, LoginCredentials } from "./types";

export interface AuthContextValue {
  user: AdminUser | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  /** the user sets their own password (the temporary one is replaced) */
  changePassword: (input: ChangePasswordInput) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
