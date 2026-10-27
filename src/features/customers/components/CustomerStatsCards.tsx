import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { CUSTOMER_API } from "../model/capabilities";
import type { CustomerStats } from "../model/types";
import { KpiCard } from "./KpiCard";

const count = (value: number | undefined) =>
  value === undefined ? undefined : formatNumber(value);

interface Props {
  stats: CustomerStats | undefined;
  /** registered in the last 7 days */
  newCustomers: number | undefined;
}

/** Total, new in 7 days, ordered in 30 days, blocked. */
export function CustomerStatsCards({ stats, newCustomers }: Props) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label={t("customers.stats.total")} value={count(stats?.total)} />
      <KpiCard label={t("customers.stats.new")} value={count(newCustomers)} />
      <KpiCard
        label={t("customers.stats.ordered30d")}
        soon={!CUSTOMER_API.orderedStat}
        value={count(stats?.ordered30d)}
      />
      <KpiCard
        label={t("customers.stats.blocked")}
        value={count(stats?.blocked)}
        tone="text-red-700"
      />
    </div>
  );
}
