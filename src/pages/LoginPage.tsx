import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LoginForm, useAuth } from "@/features/auth";
import { LanguageSwitcher, Logo } from "@/shared/ui";

export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || "/orders";

  if (user) return <Navigate to={redirectTo} replace />;

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative flex items-center justify-center px-4 pt-20 pb-10 sm:px-6">
        <div className="absolute top-5 right-6">
          <LanguageSwitcher />
        </div>
        <LoginForm onSuccess={() => navigate(redirectTo, { replace: true })} />
      </section>

      <section aria-hidden className="hidden items-center justify-center bg-brand-tint p-6 lg:flex">
        <Logo variant="hero" />
      </section>
    </div>
  );
}
