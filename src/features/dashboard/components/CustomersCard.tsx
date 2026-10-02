import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { percent } from "../lib/format";
import type { Dashboard } from "../model/types";
import { DonutChart } from "./charts/DonutChart";
import { WidgetCard } from "./Widgets";

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </div>
      <div className={`mt-1 text-xl font-extrabold tabular-nums ${danger ? "text-red-600" : ""}`}>
        {value}
      </div>
    </div>
  );
}

/** Customer base by type (individual / B2B / unverified) and a few health numbers. */
export function CustomersCard({ data }: { data: Dashboard["customers"] }) {
  const { t } = useTranslation();
  const segments = [
    {
      key: "individual",
      label: t("dashboard.customers.individual"),
      value: data.individual,
      colorClass: "text-brand",
    },
    {
      key: "b2b",
      label: t("dashboard.customers.b2b"),
      value: data.b2b,
      colorClass: "text-brand-yellow",
    },
    {
      key: "unverified",
      label: t("dashboard.customers.unverified"),
      value: data.unverified,
      colorClass: "text-slate-300",
    },
  ];

  return (
    <WidgetCard title={t("dashboard.customers.title")}>
      <div className="flex items-center gap-5">
        <DonutChart segments={segments}>
          <span className="text-lg leading-tight font-extrabold tabular-nums">
            {formatNumber(data.total)}
          </span>
          <span className="text-[11px] text-slate-500">{t("dashboard.customers.total")}</span>
        </DonutChart>
        <ul className="m-0 min-w-0 flex-1 list-none space-y-2.5 p-0 text-sm">
          {segments.map((segment) => (
            <li key={segment.key} className="flex items-center gap-2">
              <span className={`size-2.5 shrink-0 rounded-sm bg-current ${segment.colorClass}`} />
              <span className="min-w-0 flex-1 truncate">{segment.label}</span>
              <b className="tabular-nums">{formatNumber(segment.value)}</b>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <Stat label={t("dashboard.customers.active")} value={formatNumber(data.active)} />
        <Stat label={t("dashboard.customers.repeat")} value={percent(data.repeatPurchasePercent)} />
        <Stat label={t("dashboard.customers.blocked")} value={formatNumber(data.blocked)} danger />
      </div>
    </WidgetCard>
  );
}
