import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { waitParts } from "../lib/wait";
import type { ModerationStats as Stats } from "../model/types";

function Card({
  label,
  value,
  unit,
  tone = "text-slate-900",
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 text-3xl leading-none font-extrabold tabular-nums ${tone}`}>
        {value}
        {unit && <span className="ml-1.5 text-sm font-semibold text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}

/** Queue size, average wait and what was reviewed today (GET /admin/moderation/stats/). */
export function ModerationStatsRow({ stats }: { stats: Stats | undefined }) {
  const { t } = useTranslation();
  const wait = stats?.avgWaitSeconds != null ? waitParts(stats.avgWaitSeconds) : null;
  const number = (value: number | undefined) => (value === undefined ? "—" : formatNumber(value));

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card label={t("moderation.stats.pending")} value={number(stats?.pending)} />
      <Card
        label={t("moderation.stats.avgWait")}
        value={wait ? String(wait.value) : "—"}
        unit={wait ? t(`moderation.unit.${wait.unit}`) : undefined}
      />
      <Card
        label={t("moderation.stats.approvedToday")}
        value={number(stats?.approvedToday)}
        tone="text-green-700"
      />
      <Card
        label={t("moderation.stats.rejectedToday")}
        value={number(stats?.rejectedToday)}
        tone="text-red-700"
      />
    </div>
  );
}
