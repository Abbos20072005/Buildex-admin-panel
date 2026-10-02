import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { percent, weekdayLabel } from "../lib/format";
import type { Dashboard } from "../model/types";
import { ProgressBar, WidgetCard } from "./Widgets";

/** New customers per day (the busiest day is highlighted) and the mobile / web split. */
export function RegistrationsCard({ data }: { data: Dashboard["registrations"] }) {
  const { t } = useTranslation();
  const max = Math.max(1, ...data.points.map((point) => point.count));
  const peak = data.points.findIndex((point) => point.count === max && max > 0);
  const weekly = data.points.length <= 7;

  return (
    <WidgetCard
      title={t("dashboard.registrations.title")}
      extra={
        <span className="text-xs text-slate-500">
          {t("dashboard.daysShort", { count: data.days })} · {formatNumber(data.total)}
        </span>
      }
    >
      <div className="flex h-44 items-end gap-1.5">
        {data.points.map((point, index) => (
          <div
            key={point.date}
            title={`${dayjs(point.date).format("DD.MM")} · ${point.count}`}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
          >
            <div
              className={clsx("w-full rounded-t-md", index === peak ? "bg-brand" : "bg-brand/30")}
              style={{ height: `${Math.max(2, (point.count / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-[11px] text-slate-400">
        {data.points.map((point, index) => (
          <span key={point.date} className="min-w-0 flex-1 text-center">
            {weekly
              ? weekdayLabel(point.date, t)
              : index % 5 === 0
                ? dayjs(point.date).format("D")
                : ""}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>{t("dashboard.registrations.mobile")}</span>
            <b>{percent(data.mobilePercent)}</b>
          </div>
          <ProgressBar percent={data.mobilePercent} colorClass="bg-brand" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>{t("dashboard.registrations.web")}</span>
            <b>{percent(data.webPercent)}</b>
          </div>
          <ProgressBar percent={data.webPercent} colorClass="bg-brand/45" />
        </div>
      </div>
    </WidgetCard>
  );
}
