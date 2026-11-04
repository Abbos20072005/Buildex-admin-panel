import { Alert, Segmented, Tooltip } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { compactMoney, oneDecimal } from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";
import { formatNumber } from "@/shared/lib/format";
import { BarListSkeleton, TableSkeleton, WidgetCard } from "@/shared/ui";
import type { TopGroup, TopPeriod } from "../api/topSales.api";
import { useTopCustomersQuery, useTopSalesQuery } from "../hooks/queries";

const PERIODS: { value: TopPeriod; label: string }[] = [
  { value: "current_month", label: "currentMonth" },
  { value: "last_3_months", label: "last3Months" },
  { value: "year", label: "year" },
  { value: "all_time", label: "allTime" },
];

/** "12,5 mln UZS" */
function useMoney() {
  const { t } = useTranslation();
  return (value: number) => {
    const { amount, unit } = compactMoney(value, t);
    return `${amount} ${unit} UZS`.replace("  ", " ");
  };
}

/** Horizontal bars, biggest first: name, amount and share; the tooltip has the order count. */
function TopBarsCard({
  title,
  group,
  noName,
  loading,
  error,
}: {
  title: string;
  group: TopGroup | undefined;
  /** text for the row without a category / brand */
  noName: string;
  loading: boolean;
  error: unknown;
}) {
  const { t } = useTranslation();
  const money = useMoney();

  const rows = group
    ? [
        ...group.items.map((item) => ({
          key: String(item.id ?? "none"),
          name: item.name || noName,
          amount: item.amount,
          percent: item.percent,
          ordersCount: item.ordersCount,
          colorClass: "bg-brand",
        })),
        ...(group.others.count > 0
          ? [
              {
                key: "others",
                name: t("dashboard.top.others", { count: group.others.count }),
                amount: group.others.amount,
                percent: group.others.percent,
                ordersCount: group.others.ordersCount,
                colorClass: "bg-slate-300",
              },
            ]
          : []),
      ]
    : [];
  const max = Math.max(1, ...rows.map((row) => row.amount));

  return (
    <WidgetCard title={title}>
      {error && !group ? (
        <Alert type="error" showIcon title={getErrorMessage(error)} />
      ) : loading && !group ? (
        <BarListSkeleton />
      ) : rows.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">{t("dashboard.top.empty")}</div>
      ) : (
        <ul className="m-0 list-none space-y-3 p-0">
          {rows.map((row) => (
            <li key={row.key}>
              <Tooltip title={t("dashboard.top.orders", { count: row.ordersCount })}>
                <div>
                  <div className="mb-1 flex items-baseline gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate font-medium">{row.name}</span>
                    <b className="tabular-nums">{money(row.amount)}</b>
                    <span className="w-12 text-right text-xs text-slate-500 tabular-nums">
                      {oneDecimal(row.percent)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${row.colorClass}`}
                      style={{
                        width: `${row.amount > 0 ? Math.max(2, (row.amount / max) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

/** The biggest customers: the masked phone, the segment and the totals; a row opens the customer card. */
function TopCustomersCard({ period }: { period: TopPeriod }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const money = useMoney();
  const query = useTopCustomersQuery(period);
  const data = query.data;

  return (
    <WidgetCard title={t("dashboard.top.customers")}>
      {query.error && !data ? (
        <Alert type="error" showIcon title={getErrorMessage(query.error)} />
      ) : !data ? (
        <TableSkeleton columns={5} rows={6} />
      ) : data.customers.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">{t("dashboard.top.empty")}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="pb-2 font-semibold">{t("dashboard.top.customer")}</th>
                <th className="pb-2 font-semibold">{t("dashboard.top.segment")}</th>
                <th className="pb-2 text-right font-semibold">{t("dashboard.top.ordersCount")}</th>
                <th className="pb-2 text-right font-semibold">{t("dashboard.top.amount")}</th>
                <th className="pb-2 text-right font-semibold">{t("dashboard.top.lastOrder")}</th>
              </tr>
            </thead>
            <tbody>
              {data.customers.map((customer) => {
                const open = () => navigate(`/customers/${customer.id}`);
                return (
                  <tr
                    key={customer.id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    role="link"
                    tabIndex={0}
                    onClick={open}
                    onKeyDown={(event) => event.key === "Enter" && open()}
                  >
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold">
                        {customer.fullName || "—"}
                        {customer.isDeleted && (
                          <span className="ml-1.5 text-xs font-normal text-slate-400">
                            ({t("dashboard.top.deleted")})
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {customer.phoneNumber}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={
                          customer.isPro
                            ? "rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-bold text-brand"
                            : "rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500"
                        }
                      >
                        {customer.isPro ? t("role.prorab") : t("dashboard.top.b2c")}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">
                      {formatNumber(customer.ordersCount)}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-bold tabular-nums">
                      {money(customer.amount)}
                      <span className="ml-1.5 text-xs font-normal text-slate-500">
                        {oneDecimal(customer.percent)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-600 tabular-nums">
                      {customer.lastOrderAt
                        ? dayjs(customer.lastOrderAt).format("DD.MM.YYYY")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </WidgetCard>
  );
}

/** Top categories, brands and customers by sold amount; one period for all three. */
export function TopSalesSection() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TopPeriod>("current_month");
  const sales = useTopSalesQuery(period);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-base font-bold">{t("dashboard.top.title")}</h2>
        <Segmented<TopPeriod>
          size="small"
          value={period}
          onChange={setPeriod}
          options={PERIODS.map((item) => ({
            value: item.value,
            label: t(`dashboard.top.period.${item.label}`),
          }))}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <TopBarsCard
          title={t("dashboard.top.categories")}
          group={sales.data?.categories}
          noName={t("dashboard.top.noCategory")}
          loading={sales.isLoading}
          error={sales.error}
        />
        <TopBarsCard
          title={t("dashboard.top.brands")}
          group={sales.data?.brands}
          noName={t("dashboard.top.noBrand")}
          loading={sales.isLoading}
          error={sales.error}
        />
      </div>
      <TopCustomersCard period={period} />
    </section>
  );
}
