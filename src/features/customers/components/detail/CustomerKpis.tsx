import { useTranslation } from "react-i18next";
import { formatDate, formatNumber } from "@/shared/lib/format";
import { CUSTOMER_API } from "../../model/capabilities";
import type { Customer } from "../../model/types";
import { KpiCard } from "../KpiCard";

/** Orders, total purchase, average check, returns, last order (taken from the newest order). */
export function CustomerKpis({
  customer,
  lastOrderAt,
}: {
  customer: Customer;
  lastOrderAt: string | null | undefined;
}) {
  const { t } = useTranslation();
  const average = customer.ordersCount ? customer.totalPurchase / customer.ordersCount : 0;
  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard
        compact
        label={t("customers.kpi.orders")}
        value={formatNumber(customer.ordersCount)}
      />
      <KpiCard
        compact
        label={t("customers.kpi.purchase")}
        value={formatNumber(customer.totalPurchase)}
      />
      <KpiCard compact label={t("customers.kpi.average")} value={formatNumber(average)} />
      <KpiCard
        compact
        label={t("customers.kpi.returns")}
        soon={!CUSTOMER_API.returns || customer.returnsCount === null}
        value={customer.returnsCount === null ? undefined : formatNumber(customer.returnsCount)}
      />
      <KpiCard
        compact
        label={t("customers.kpi.lastOrder")}
        value={lastOrderAt ? formatDate(lastOrderAt) : undefined}
      />
    </div>
  );
}
