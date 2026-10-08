import { clsx } from "@/shared/lib/clsx";

interface LogoProps {
  /** "sidebar" — compact, for the light sidebar; "hero" — big, brand colours */
  variant?: "sidebar" | "hero";
  className?: string;
}

/** Buildex logo — the same assets as buildex.uz (public/logo.png + public/logo-text.png). */
export function Logo({ variant = "sidebar", className }: LogoProps) {
  const hero = variant === "hero";

  return (
    <div className={clsx("flex items-center", hero ? "gap-5" : "gap-2", className)}>
      <img
        src="/logo.png"
        alt=""
        aria-hidden
        className={clsx("animate-spin-y", hero ? "size-24" : "size-8")}
        width={hero ? 96 : 32}
        height={hero ? 96 : 32}
      />
      <img
        src="/logo-text.png"
        alt="buildex"
        className={clsx("w-auto", hero ? "h-[72px]" : "h-[22px]")}
        width={hero ? 310 : 95}
        height={hero ? 72 : 22}
      />
      {!hero && <span className="mt-1 text-xs font-medium text-slate-500">Admin</span>}
    </div>
  );
}
