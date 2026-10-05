import { clsx } from "@/shared/lib/clsx";

/** Soft background + text colour pairs; a person always gets the same one. */
const TONES = [
  "bg-blue-50 text-blue-700",
  "bg-amber-50 text-amber-700",
  "bg-emerald-50 text-emerald-700",
  "bg-violet-50 text-violet-700",
  "bg-rose-50 text-rose-700",
  "bg-sky-50 text-sky-700",
];

interface Props {
  name: string;
  /** photo; without it the initials are shown */
  src?: string | null;
  size?: number;
  className?: string;
}

/** Round avatar: the photo, or the initials of the name on a soft colour. */
export function InitialsAvatar({ name, src, size = 36, className }: Props) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "?";
  const tone = TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TONES.length];

  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{ width: size, height: size }}
        className={clsx("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size }}
      className={clsx(
        "grid shrink-0 place-items-center rounded-full text-xs font-bold",
        tone,
        className,
      )}
    >
      {initials}
    </span>
  );
}
