import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { brand } from "@/theme";
import { percent, weekdayLabel } from "../lib/format";
import type { Dashboard, Period } from "../model/types";
import { LineChart } from "./charts/LineChart";
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
  const monthly = data.step === "month";
  const weekly = !monthly && data.points.length <= 7;

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
      <LineChart
        height={200}
        labels={data.points.map((point) =>
          monthly
            ? dayjs(point.date).format("MMM")
            : weekly
              ? weekdayLabel(point.date, t)
              : dayjs(point.date).format("D"),
        )}
        labelEvery={monthly || weekly ? 1 : 5}
        series={[
          {
            key: "registrations",
            name: t("dashboard.registrations.title"),
            color: brand.primary,
            values: data.points.map((point) => point.count),
          },
        ]}
      />

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
