import { clsx } from "@/shared/lib/clsx";

interface LogoProps {
  /** "sidebar" — compact, white wordmark for dark backgrounds; "hero" — big, brand colours */
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
        className={clsx("w-auto", hero ? "h-[72px]" : "h-[22px] brightness-0 invert")}
        width={hero ? 310 : 95}
        height={hero ? 72 : 22}
      />
      {!hero && (
        <span className="mt-1 text-[10.5px] font-semibold tracking-[0.12em] text-brand-yellow">
          ADMIN
        </span>
      )}
    </div>
  );
}
