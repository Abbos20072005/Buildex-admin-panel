import { Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatNumber } from "@/shared/lib/format";
import type { Dashboard } from "../model/types";
import { CardLink, WidgetCard } from "./Widgets";

/** Active products by stock level, incomplete cards and the moderation queue. */
export function CatalogCard({
  data,
  moderationQueue,
}: {
  data: Dashboard["catalog"];
  moderationQueue: number;
}) {
  const { t } = useTranslation();
  // in stock + low + out = all active products; incomplete cards overlap them, so they are
  // listed below but not part of the bar
  const rows = [
    { key: "in", label: t("dashboard.catalog.inStock"), value: data.inStock, dot: "bg-green-700" },
    {
      key: "low",
      label: t("dashboard.catalog.lowStock"),
      value: data.lowStock,
      dot: "bg-brand-yellow",
    },
    {
      key: "out",
      label: t("dashboard.catalog.outOfStock"),
      value: data.outOfStock,
      dot: "bg-red-600",
    },
    {
      key: "incomplete",
      label: t("dashboard.catalog.incomplete"),
      value: data.incomplete,
      dot: "bg-slate-300",
    },
  ];
  const barTotal = Math.max(1, data.inStock + data.lowStock + data.outOfStock);

  return (
    <WidgetCard
      title={t("dashboard.catalog.title")}
      extra={<CardLink to="/products">{t("dashboard.catalog.products")}</CardLink>}
    >
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
        {rows.slice(0, 3).map((row) => (
          <Tooltip
            key={row.key}
            title={`${row.label}: ${formatNumber(row.value)} · ${((row.value / barTotal) * 100).toFixed(1)}%`}
          >
            <div className={row.dot} style={{ width: `${(row.value / barTotal) * 100}%` }} />
          </Tooltip>
        ))}
      </div>

      <ul className="m-0 mt-4 list-none space-y-3 p-0 text-sm">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2.5">
            <span className={`size-2.5 shrink-0 rounded-sm ${row.dot}`} />
            <span className="flex-1">{row.label}</span>
            <b className="tabular-nums">{formatNumber(row.value)}</b>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
        <span className="text-slate-600">{t("dashboard.catalog.moderation")}</span>
        <span className="flex items-center gap-3">
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            {t("dashboard.catalog.pending", { count: moderationQueue })}
          </span>
          <Link to="/products/moderation" className="font-semibold">
            {t("dashboard.catalog.open")}
          </Link>
        </span>
      </div>
    </WidgetCard>
  );
}
