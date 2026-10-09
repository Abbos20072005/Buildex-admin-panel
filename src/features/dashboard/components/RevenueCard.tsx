import { Segmented } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { brand } from "@/theme";
import { compactMoney, percent } from "../lib/format";
import type { Dashboard } from "../model/types";
import { LineChart } from "./charts/LineChart";
import { WidgetCard } from "./Widgets";

/** Time spans of the chart, in months (the API takes 1–24). */
export const REVENUE_MONTHS = [3, 6, 12] as const;

interface Props {
  data: Dashboard["revenue"];
  months: number;
  onMonthsChange: (months: number) => void;
}

/** Revenue by month as two lines: B2B (prorab) customers next to everyone else. */
export function RevenueCard({ data, months, onMonthsChange }: Props) {
  const { t } = useTranslation();
  const total = data.b2b + data.individual;
  const share = total > 0 ? (data.b2b / total) * 100 : 0;
  const b2b = compactMoney(data.b2b, t);
  const individual = compactMoney(data.individual, t);

  return (
    <WidgetCard
      title={t("dashboard.revenue.title")}
      extra={
        <Segmented<number>
          size="small"
          value={months}
          onChange={onMonthsChange}
          options={REVENUE_MONTHS.map((value) => ({
            value,
            label: t(`dashboard.revenue.range${value}`),
          }))}
        />
      }
    >
      <LineChart
        width={1040}
        height={260}
        labels={data.months.map((month) => dayjs(month.month).format("MMM"))}
        series={[
          {
            key: "b2b",
            name: "B2B",
            color: brand.primary,
            values: data.months.map((month) => month.b2b),
          },
          {
            key: "individual",
            name: t("dashboard.revenue.individual"),
            color: brand.yellow,
            values: data.months.map((month) => month.individual),
          },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand" />
          B2B · {b2b.amount} {b2b.unit}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-brand-yellow" />
          {t("dashboard.revenue.individual")} · {individual.amount} {individual.unit}
        </span>
        <span className="ml-auto font-semibold">
          {t("dashboard.revenue.share")} <b className="text-green-700">{percent(share)}</b>
        </span>
      </div>
    </WidgetCard>
  );
}
