import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { compactMoney, percent } from "../lib/format";
import type { Dashboard } from "../model/types";
import { WidgetCard } from "./Widgets";

/** Revenue by month: B2B (prorab) customers next to everyone else. */
export function RevenueCard({ data }: { data: Dashboard["revenue"] }) {
  const { t } = useTranslation();
  const max = Math.max(1, ...data.months.flatMap((month) => [month.b2b, month.individual]));
  const total = data.b2b + data.individual;
  const share = total > 0 ? (data.b2b / total) * 100 : 0;
  const b2b = compactMoney(data.b2b, t);
  const individual = compactMoney(data.individual, t);

  return (
    <WidgetCard
      title={t("dashboard.revenue.title")}
      extra={
        <span className="text-xs text-slate-500">
          {data.months.length > 0 &&
            `${dayjs(data.months[0].month).format("MMM")} – ${dayjs(data.months[data.months.length - 1].month).format("MMM")}`}{" "}
          · {t("dashboard.revenue.currency")}
        </span>
      }
    >
      <div className="flex h-56 items-end gap-5">
        {data.months.map((month) => (
          <div key={month.month} className="flex h-full min-w-0 flex-1 flex-col">
            <div className="flex flex-1 items-end gap-1.5">
              <div
                className="w-full rounded-t-md bg-brand"
                style={{ height: `${Math.max(1, (month.b2b / max) * 100)}%` }}
                title={`B2B: ${compactMoney(month.b2b, t).amount} ${compactMoney(month.b2b, t).unit}`}
              />
              <div
                className="w-full rounded-t-md bg-brand/30"
                style={{ height: `${Math.max(1, (month.individual / max) * 100)}%` }}
                title={`${t("dashboard.revenue.individual")}: ${compactMoney(month.individual, t).amount} ${compactMoney(month.individual, t).unit}`}
              />
            </div>
            <div className="mt-2 text-center text-[11px] text-slate-400">
              {dayjs(month.month).format("MMM")}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand" />
          B2B · {b2b.amount} {b2b.unit}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand/30" />
          {t("dashboard.revenue.individual")} · {individual.amount} {individual.unit}
        </span>
        <span className="ml-auto font-semibold">
          {t("dashboard.revenue.share")} <b className="text-green-700">{percent(share)}</b>
        </span>
      </div>
    </WidgetCard>
  );
}
