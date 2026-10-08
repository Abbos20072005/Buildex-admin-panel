import { DownloadIcon } from "@/shared/icons";
import { Alert, Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DashboardSkeleton,
  DashboardView,
  DateRangeButton,
  exportDashboardCsv,
  spans,
  toApiPeriod,
  useDashboardQuery,
  type DashboardParams,
  type DateRange,
  type Period,
} from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";

export function DashboardPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<DateRange>({ days: 30 });
  // every chart card has its own time span
  const [deliveredPeriod, setDeliveredPeriod] = useState<Period>("week");
  const [registrationsPeriod, setRegistrationsPeriod] = useState<Period>("week");
  const [months, setMonths] = useState(6);

  const base = { range, months, lowStock: 10 };
  const params: DashboardParams = { ...base, period: toApiPeriod(deliveredPeriod) };
  const dashboard = useDashboardQuery(params);
  // the API has one `period` per response: a second request only when the two cards differ
  // (with equal periods both share the same cached response)
  const registrationsQuery = useDashboardQuery({
    ...base,
    period: toApiPeriod(registrationsPeriod),
  });
  const registrationsData = registrationsQuery.data?.registrations ?? dashboard.data?.registrations;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("dashboard.home")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.dashboard")}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <DateRangeButton value={range} onChange={setRange} />
          <Button
            type="primary"
            icon={<DownloadIcon />}
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
      ) : dashboard.data && registrationsData ? (
        <DashboardView
          data={dashboard.data}
          delivered={{
            data: spans.delivered(dashboard.data.delivered, deliveredPeriod),
            period: deliveredPeriod,
            onPeriodChange: setDeliveredPeriod,
          }}
          registrations={{
            data: spans.registrations(registrationsData, registrationsPeriod),
            period: registrationsPeriod,
            onPeriodChange: setRegistrationsPeriod,
          }}
          months={months}
          onMonthsChange={setMonths}
        />
      ) : (
        <DashboardSkeleton />
      )}
    </>
  );
}
