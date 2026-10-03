import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { percent } from "../lib/format";

export { CardLink, WidgetCard } from "@/shared/ui";

/**
 * ▲ 12,4% / ▼ 5,2% against the previous period; "—" when there is nothing to compare with,
 * "o'zgarishsiz" when the value did not change.
 */
export function Change({
  value,
  suffix,
  className,
}: {
  value: number | null;
  suffix?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  if (value === null) {
    return <span className={clsx("text-xs text-slate-400", className)}>—</span>;
  }
  if (value === 0) {
    return (
      <span className={clsx("text-xs text-slate-400", className)}>
        — {t("dashboard.unchanged")}
      </span>
    );
  }
  return (
    <span className={clsx("text-xs", className)}>
      <b className={value > 0 ? "text-green-700" : "text-red-600"}>
        {value > 0 ? "▲" : "▼"} {percent(value)}
      </b>
      {suffix && <span className="ml-1 text-slate-400">{suffix}</span>}
    </span>
  );
}

/** Horizontal progress bar; `colorClass` is a Tailwind `bg-*` class. */
export function ProgressBar({
  percent: value,
  colorClass,
}: {
  percent: number;
  colorClass: string;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={clsx("h-full rounded-full", colorClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
