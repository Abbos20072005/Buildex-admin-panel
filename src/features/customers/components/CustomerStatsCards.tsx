import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { StatCard } from "@/shared/ui";
import type { CustomerStats } from "../model/types";

const count = (value: number | undefined) =>
  value === undefined ? undefined : formatNumber(value);

/** Total, active in the last 30 days, B2B (prorab) and blocked customers. */
export function CustomerStatsCards({ stats }: { stats: CustomerStats | undefined }) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t("customers.stats.total")}
        value={count(stats?.total)}
        note={t("customers.stats.totalNote")}
      />
      <StatCard
        label={t("customers.stats.active")}
        value={count(stats?.active)}
        note={t("customers.stats.activeNote")}
        tone="text-emerald-700"
      />
      <StatCard
        label={t("customers.stats.b2b")}
        value={count(stats?.b2b)}
        note={t("customers.stats.b2bNote")}
        tone="text-blue-700"
      />
      <StatCard
        label={t("customers.stats.blocked")}
        value={count(stats?.blocked)}
        note={t("customers.stats.blockedNote")}
        tone="text-red-700"
      />
    </div>
  );
}
