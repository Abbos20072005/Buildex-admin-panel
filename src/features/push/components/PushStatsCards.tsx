import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { StatCard } from "@/shared/ui";
import type { PushStats } from "../model/types";

const count = (value: number | undefined) =>
  value === undefined ? undefined : formatNumber(value);

/** Last 30 days: published and opened; and how many are waiting or unfinished. */
export function PushStatsCards({ stats }: { stats: PushStats | undefined }) {
  const { t } = useTranslation();
  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t("push.stats.published30d")}
        value={count(stats?.published30d)}
        note={t("push.stats.published30dNote")}
      />
      <StatCard
        label={t("push.stats.reads30d")}
        value={count(stats?.reads30d)}
        note={t("push.stats.reads30dNote")}
        tone="text-emerald-700"
      />
      <StatCard
        label={t("push.stats.scheduled")}
        value={count(stats?.scheduled)}
        note={t("push.stats.scheduledNote")}
        tone="text-blue-700"
      />
      <StatCard
        label={t("push.stats.draft")}
        value={count(stats?.draft)}
        note={t("push.stats.draftNote")}
        tone="text-amber-700"
      />
    </div>
  );
}
