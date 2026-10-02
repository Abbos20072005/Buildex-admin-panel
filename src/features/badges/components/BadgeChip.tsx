import { badgeTextColor } from "../lib/color";

/** The badge as the customer sees it: the name on the badge's colour. */
export function BadgeChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-block max-w-full truncate rounded-md px-2.5 py-1 text-xs leading-4 font-bold"
      style={{ backgroundColor: color, color: badgeTextColor(color) }}
    >
      {name || "—"}
    </span>
  );
}
