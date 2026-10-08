import { Skeleton } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useManagersQuery } from "@/features/managers";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { CardLink, WidgetCard } from "./Widgets";

const SHOWN = 5;

/** "SE" for "Shahzod Ergashev" */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

/** The newest managers from the managers API and how many of them work. */
export function ManagersCard() {
  const { t } = useTranslation();
  const list = useManagersQuery({ filters: {}, page: 1, pageSize: SHOWN });
  const active = useManagersQuery({ filters: { isActive: true }, page: 1, pageSize: 1 });

  const total = list.data?.total ?? 0;
  const activeCount = active.data?.total ?? 0;

  return (
    <WidgetCard
      title={t("dashboard.managers.title")}
      extra={<CardLink to="/managers">{t("dashboard.managers.team")}</CardLink>}
    >
      {list.isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : list.data && list.data.items.length > 0 ? (
        <ul className="m-0 list-none space-y-3 p-0">
          {list.data.items.map((manager) => (
            <li key={manager.id} className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                {initials(manager.fullName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{manager.fullName}</span>
                <span className="block text-xs text-slate-400">
                  {dayjs(manager.createdAt).format("DD.MM.YYYY")}
                </span>
              </span>
              <span
                className={clsx(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                  manager.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500",
                )}
              >
                {manager.isActive
                  ? t("dashboard.managers.active")
                  : t("dashboard.managers.inactive")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6 text-center text-sm text-slate-400">{t("common.noData")}</div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        {[
          { label: t("dashboard.managers.total"), value: total },
          { label: t("dashboard.managers.activeCount"), value: activeCount },
          { label: t("dashboard.managers.inactiveCount"), value: Math.max(0, total - activeCount) },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-[11px] tracking-wide text-slate-500 uppercase">{stat.label}</div>
            <div className="mt-1 text-lg font-bold tabular-nums">{formatNumber(stat.value)}</div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
