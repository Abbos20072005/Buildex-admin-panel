import { Tooltip } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { percent, weekdayLabel } from "../lib/format";
import type { Dashboard, Period } from "../model/types";
import { PeriodSwitch } from "./PeriodSwitch";
import { ProgressBar, WidgetCard } from "./Widgets";

interface Props {
  data: Dashboard["registrations"];
  period: Period;
  onPeriodChange: (period: Period) => void;
}

/** New customers per day (the busiest day is highlighted) and the mobile / web split. */
export function RegistrationsCard({ data, period, onPeriodChange }: Props) {
  const { t } = useTranslation();
  const max = Math.max(1, ...data.points.map((point) => point.count));
  const peak = data.points.findIndex((point) => point.count === max && max > 0);
  const monthly = data.step === "month";
  const weekly = !monthly && data.points.length <= 7;

  const label = (date: string, index: number) => {
    if (monthly) return dayjs(date).format("MMM");
    if (weekly) return weekdayLabel(date, t);
    return index % 5 === 0 ? dayjs(date).format("D") : "";
  };

  return (
    <WidgetCard
      title={t("dashboard.registrations.title")}
      extra={<PeriodSwitch value={period} onChange={onPeriodChange} />}
    >
      <div className="mb-3 text-xs text-slate-500">
        {monthly
          ? t("dashboard.monthsShort", { count: data.points.length })
          : t("dashboard.daysShort", { count: data.days })}{" "}
        · {formatNumber(data.total)}
      </div>
      <div className="flex h-44 items-end gap-1.5">
        {data.points.map((point, index) => (
          <Tooltip
            key={point.date}
            title={`${dayjs(point.date).format("DD.MM.YYYY")} · ${formatNumber(point.count)}`}
          >
            <div className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div
                className={clsx("w-full rounded-t-md", index === peak ? "bg-brand" : "bg-brand/30")}
                style={{ height: `${Math.max(2, (point.count / max) * 100)}%` }}
              />
            </div>
          </Tooltip>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-[11px] text-slate-400">
        {data.points.map((point, index) => (
          <span key={point.date} className="min-w-0 flex-1 text-center">
            {label(point.date, index)}
          </span>
        ))}
      </div>

      {data.hasSplit && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>{t("dashboard.registrations.mobile")}</span>
              <b>{percent(data.mobilePercent)}</b>
            </div>
            <ProgressBar
              percent={data.mobilePercent}
              colorClass="bg-brand"
              label={t("dashboard.registrations.mobile")}
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>{t("dashboard.registrations.web")}</span>
              <b>{percent(data.webPercent)}</b>
            </div>
            <ProgressBar
              percent={data.webPercent}
              colorClass="bg-brand/45"
              label={t("dashboard.registrations.web")}
            />
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
