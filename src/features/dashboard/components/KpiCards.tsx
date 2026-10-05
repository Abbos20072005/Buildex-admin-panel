import { ChartIcon, CartIcon, UserIcon, WalletIcon } from "@/shared/icons";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { compactMoney } from "../lib/format";
import type { Dashboard } from "../model/types";
import { Change } from "./Widgets";

function KpiCard({
  icon,
  tone,
  label,
  value,
  unit,
  change,
  days,
}: {
  icon: ReactNode;
  /** Tailwind classes for the icon bubble */
  tone: string;
  label: string;
  value: string;
  unit?: string;
  change: number | null;
  days: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-500">
        <span className={`grid size-8 place-items-center rounded-lg text-base ${tone}`}>
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-3 text-3xl leading-none font-extrabold tracking-tight tabular-nums">
        {value}
        {unit && <span className="ml-1.5 text-base font-bold text-slate-500">{unit}</span>}
      </div>
      <div className="mt-2">
        <Change value={change} suffix={t("dashboard.daysShort", { count: days })} />
      </div>
    </div>
  );
}

/** The four KPI cards of the chosen window (orders, revenue, average check, new customers). */
export function KpiCards({ summary }: { summary: Dashboard["summary"] }) {
  const { t } = useTranslation();
  const revenue = compactMoney(summary.revenue.value, t);
  const average = compactMoney(summary.averageCheck.value, t);
  const unit = (money: { unit: string }) => `${money.unit} UZS`.trim();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={<CartIcon />}
        tone="bg-brand-soft text-brand"
        label={t("dashboard.kpi.orders")}
        value={formatNumber(summary.orders.value)}
        change={summary.orders.change}
        days={summary.days}
      />
      <KpiCard
        icon={<WalletIcon />}
        tone="bg-amber-50 text-amber-600"
        label={t("dashboard.kpi.revenue")}
        value={revenue.amount}
        unit={unit(revenue)}
        change={summary.revenue.change}
        days={summary.days}
      />
      <KpiCard
        icon={<ChartIcon />}
        tone="bg-brand-soft text-brand"
        label={t("dashboard.kpi.averageCheck")}
        value={average.amount}
        unit={unit(average)}
        change={summary.averageCheck.change}
        days={summary.days}
      />
      <KpiCard
        icon={<UserIcon />}
        tone="bg-green-50 text-green-700"
        label={t("dashboard.kpi.newCustomers")}
        value={formatNumber(summary.newCustomers.value)}
        change={summary.newCustomers.change}
        days={summary.days}
      />
    </div>
  );
}
