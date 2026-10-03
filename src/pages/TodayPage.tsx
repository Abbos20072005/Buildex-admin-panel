import { Alert, Button } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { TodaySkeleton, TodayView, useTodayQuery } from "@/features/today";
import { getErrorMessage } from "@/shared/api";

export function TodayPage() {
  const { t } = useTranslation();
  const today = useTodayQuery();

  return (
    <>
      <div className="mb-4">
        <div className="text-xs text-slate-500">
          {t("dashboard.home")} / {t("nav.today")}
        </div>
        <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.today")}</h1>
        {today.data && (
          <div className="mt-0.5 text-xs text-slate-500">
            {dayjs(today.data.now).format("DD.MM.YYYY · HH:mm")}
          </div>
        )}
      </div>

      {today.error && !today.data ? (
        <Alert
          type="error"
          showIcon
          title={t("today.loadError")}
          description={getErrorMessage(today.error)}
          action={
            <Button size="small" onClick={() => void today.refetch()}>
              {t("common.retry")}
            </Button>
          }
        />
      ) : today.data ? (
        <TodayView data={today.data} />
      ) : (
        <TodaySkeleton />
      )}
    </>
  );
}
