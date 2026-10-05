import { useTranslation } from "react-i18next";
import { StatCard } from "@/shared/ui";
import type { BannerStats } from "../model/types";

/** Active / scheduled / expired / "needs checking" (external links) counters. */
export function StatsCards({ stats }: { stats: BannerStats | undefined }) {
  const { t } = useTranslation();
  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t("banners.stats.active")}
        value={stats?.active}
        note={t("banners.stats.activeNote")}
      />
      <StatCard
        label={t("banners.stats.scheduled")}
        value={stats?.scheduled}
        note={t("banners.stats.scheduledNote")}
      />
      <StatCard
        label={t("banners.stats.expired")}
        value={stats?.expired}
        note={t("banners.stats.expiredNote")}
        tone="text-amber-700"
      />
      <StatCard
        label={t("banners.stats.external")}
        value={stats?.external}
        note={t("banners.stats.externalNote")}
        tone="text-red-700"
      />
    </div>
  );
}
