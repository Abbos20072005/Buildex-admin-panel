import { InfoCircleIcon } from "@/shared/icons";
import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { compactMoney, percent } from "@/features/dashboard";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import type { Metric, SalesAnalytics } from "../model/types";

/** ▲ 2,2% / ▼ 0,1 p.p. against the previous period; for cancels and refunds a fall is good. */
function ChangeMark({
  change,
  unit,
  lowerIsBetter,
}: {
  change: number | null;
  unit: "percent" | "pp";
  lowerIsBetter?: boolean;
}) {
  const { t } = useTranslation();
  if (change === null) return <span className="text-xs text-slate-400">—</span>;
  if (change === 0) {
    return <span className="text-xs text-slate-400">— {t("dashboard.unchanged")}</span>;
  }
  const up = change > 0;
  const good = lowerIsBetter ? !up : up;
  return (
    <span className={clsx("text-xs font-bold", good ? "text-green-700" : "text-red-600")}>
      {up ? "▲" : "▼"} {percent(change)}
      {unit === "pp" ? ` ${t("analytics.pp")}` : ""}
    </span>
  );
}

function Card({
  label,
  hint,
  value,
  unit,
  change,
  changeUnit,
  lowerIsBetter,
  compare,
}: {
  label: string;
  hint: string;
  value: string;
  unit?: string;
  change: Metric["change"];
  changeUnit: "percent" | "pp";
  lowerIsBetter?: boolean;
  compare: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
        {label}
        <Tooltip title={hint}>
          <InfoCircleIcon className="text-slate-400" />
        </Tooltip>
      </div>
      <div className="mt-2 text-2xl leading-none font-extrabold tracking-tight tabular-nums">
        {value}
        {unit && <span className="ml-1.5 text-sm font-bold text-slate-500">{unit}</span>}
      </div>
      <div className="mt-2 h-4">
        {compare && <ChangeMark change={change} unit={changeUnit} lowerIsBetter={lowerIsBetter} />}
      </div>
    </div>
  );
}

/** The six KPI cards of the period. */
export function KpiRow({
  summary,
  compare,
}: {
  summary: SalesAnalytics["summary"];
  compare: boolean;
}) {
  const { t } = useTranslation();
  const revenue = compactMoney(summary.revenue.value, t);
  const money = (amount: { unit: string }) => `${amount.unit} UZS`.trim();

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <Card
        label={t("analytics.kpi.revenue")}
        hint={t("analytics.kpiHint.revenue")}
        value={revenue.amount}
        unit={money(revenue)}
        change={summary.revenue.change}
        changeUnit="percent"
        compare={compare}
      />
      <Card
        label={t("analytics.kpi.orders")}
        hint={t("analytics.kpiHint.orders")}
        value={formatNumber(summary.orders.value)}
        change={summary.orders.change}
        changeUnit="percent"
        compare={compare}
      />
      <Card
        label={t("analytics.kpi.averageCheck")}
        hint={t("analytics.kpiHint.averageCheck")}
        value={formatNumber(Math.round(summary.averageCheck.value))}
        unit="UZS"
        change={summary.averageCheck.change}
        changeUnit="percent"
        compare={compare}
      />
      <Card
        label={t("analytics.kpi.cancelRate")}
        hint={t("analytics.kpiHint.cancelRate")}
        value={percent(summary.cancelRate.value)}
        change={summary.cancelRate.change}
        changeUnit="pp"
        lowerIsBetter
        compare={compare}
      />
      <Card
        label={t("analytics.kpi.refundRate")}
        hint={t("analytics.kpiHint.refundRate")}
        value={percent(summary.refundRate.value)}
        change={summary.refundRate.change}
        changeUnit="pp"
        lowerIsBetter
        compare={compare}
      />
      <Card
        label={t("analytics.kpi.repeatRate")}
        hint={t("analytics.kpiHint.repeatRate")}
        value={percent(summary.repeatRate.value)}
        change={summary.repeatRate.change}
        changeUnit="pp"
        compare={compare}
      />
    </div>
  );
}
