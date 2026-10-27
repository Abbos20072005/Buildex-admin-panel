import { useTranslation } from "react-i18next";

interface Props {
  label: string;
  value: string | undefined;
  /** Tailwind text colour of the number */
  tone?: string;
  /** a smaller number, for the figures of a customer card */
  compact?: boolean;
  /** the figure needs the backend: "Backend kutilmoqda" instead of the number */
  soon?: boolean;
}

/** A counter of the customer pages: small label, big number. */
export function KpiCard({ label, value, tone = "text-slate-900", compact, soon }: Props) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      {soon ? (
        <div
          className={`font-medium text-slate-400 ${compact ? "mt-2.5 text-sm" : "mt-3 text-base"}`}
        >
          {t("customers.soon")}
        </div>
      ) : (
        <div
          className={`mt-2 leading-none font-extrabold tabular-nums ${tone} ${compact ? "text-2xl" : "text-3xl"}`}
        >
          {value ?? "—"}
        </div>
      )}
    </div>
  );
}
