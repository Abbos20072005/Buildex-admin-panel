import { useTranslation } from "react-i18next";
import type { BannerStats } from "../model/types";

function Card({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: number | undefined;
  note: string;
  /** Tailwind text colour of the number */
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className={`mt-2 text-3xl leading-none font-extrabold tabular-nums ${tone}`}>
        {value ?? "—"}
      </div>
      <div className="mt-2 text-xs text-slate-500">{note}</div>
    </div>
  );
}

/** Active / scheduled / expired / "needs checking" (external links) counters. */
export function StatsCards({ stats }: { stats: BannerStats | undefined }) {
  const { t } = useTranslation();
  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        label={t("banners.stats.active")}
        value={stats?.active}
        note={t("banners.stats.activeNote")}
        tone="text-slate-900"
      />
      <Card
        label={t("banners.stats.scheduled")}
        value={stats?.scheduled}
        note={t("banners.stats.scheduledNote")}
        tone="text-slate-900"
      />
      <Card
        label={t("banners.stats.expired")}
        value={stats?.expired}
        note={t("banners.stats.expiredNote")}
        tone="text-amber-700"
      />
      <Card
        label={t("banners.stats.external")}
        value={stats?.external}
        note={t("banners.stats.externalNote")}
        tone="text-red-700"
      />
    </div>
  );
}
