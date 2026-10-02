import { CalendarOutlined, DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Dropdown } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DashboardSkeleton,
  DashboardView,
  exportDashboardCsv,
  rangeLabel,
  useDashboardQuery,
  type DashboardParams,
  type Period,
} from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";

/** KPI windows offered in the date button (the API takes 1–365 days) */
const DAY_PRESETS = [7, 30, 90, 365];

export function DashboardPage() {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const [period, setPeriod] = useState<Period>("week");

  const params: DashboardParams = { days, period, months: 6, lowStock: 10 };
  const dashboard = useDashboardQuery(params);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("dashboard.home")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.dashboard")}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Dropdown
            trigger={["click"]}
            menu={{
              selectedKeys: [String(days)],
              items: DAY_PRESETS.map((preset) => ({
                key: String(preset),
                label: t("dashboard.lastDays", { count: preset }),
              })),
              onClick: ({ key }) => setDays(Number(key)),
            }}
          >
            <Button icon={<CalendarOutlined />}>{rangeLabel(days)}</Button>
          </Dropdown>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            disabled={!dashboard.data}
            onClick={() => dashboard.data && exportDashboardCsv(dashboard.data, t)}
          >
            {t("dashboard.export.button")}
          </Button>
        </div>
      </div>

      {dashboard.error && !dashboard.data ? (
        <Alert
          type="error"
          showIcon
          title={t("dashboard.loadError")}
          description={getErrorMessage(dashboard.error)}
          action={
            <Button size="small" onClick={() => void dashboard.refetch()}>
              {t("common.retry")}
            </Button>
          }
        />
      ) : dashboard.data ? (
        <DashboardView data={dashboard.data} period={period} onPeriodChange={setPeriod} />
      ) : (
        <DashboardSkeleton />
      )}
    </>
  );
}
