import { Card } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { percent } from "@/features/dashboard";
import { formatNumber } from "@/shared/lib/format";
import type { SalesAnalytics } from "../model/types";

/** Repeat purchase by the month of the first order: darker cell — more customers came back. */
export function CohortsCard({ cohorts }: { cohorts: SalesAnalytics["cohorts"] }) {
  const { t } = useTranslation();
  const columns = Array.from({ length: cohorts.offsets }, (_, i) => i + 1);

  return (
    <Card
      title={<span className="text-base font-bold">{t("analytics.cohorts.title")}</span>}
      extra={<span className="text-xs text-slate-500">{t("analytics.cohorts.subtitle")}</span>}
    >
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[560px] items-center gap-1.5"
          style={{ gridTemplateColumns: `180px repeat(${cohorts.offsets}, minmax(0, 1fr))` }}
        >
          <span />
          {columns.map((n) => (
            <span key={n} className="text-center text-xs text-slate-400">
              {t("analytics.cohorts.month", { count: n })}
            </span>
          ))}

          {cohorts.rows.map((row) => (
            <div key={row.month} className="contents">
              <span className="text-xs text-slate-600">
                {dayjs(row.month).format("MMMM")} · {formatNumber(row.customers)}{" "}
                {t("analytics.cohorts.customers")}
              </span>
              {columns.map((n, index) => {
                const value = row.percents[index] ?? null;
                return (
                  <span
                    key={n}
                    className="grid h-9 place-items-center rounded-lg text-xs font-bold tabular-nums"
                    style={
                      value === null
                        ? { background: "var(--color-surface)" }
                        : {
                            background: `color-mix(in srgb, var(--color-brand) ${Math.round(15 + value * 1.6)}%, var(--ant-color-bg-container))`,
                            color: value > 30 ? "white" : undefined,
                          }
                    }
                  >
                    {value === null ? "–" : percent(value)}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="m-0 mt-3 text-xs text-slate-500">{t("analytics.cohorts.note")}</p>
    </Card>
  );
}
