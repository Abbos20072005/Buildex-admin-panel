import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../model/auth-context";

/** Where an account with a temporary password sets its own. */
export const CHANGE_PASSWORD_PATH = "/change-password";

/**
 * Sends guests to /login and brings them back to the requested page afterwards; an account
 * with a temporary password is sent to the "set your password" page first.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (user.mustChangePassword && location.pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
  }
  return children;
}
