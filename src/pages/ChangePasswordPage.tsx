import { useNavigate } from "react-router-dom";
import { ChangePasswordForm } from "@/features/auth";
import { LanguageSwitcher } from "@/shared/ui";

/** Shown instead of the admin to an account that still has a temporary password. */
export function ChangePasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="relative grid min-h-screen place-items-center bg-white px-4 py-10">
      <div className="absolute top-5 right-6">
        <LanguageSwitcher />
      </div>
      <ChangePasswordForm onSuccess={() => navigate("/", { replace: true })} />
    </div>
  );
}
