import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { CardLink, WidgetCard } from "@/shared/ui";
import type { Today } from "../model/types";

function Row({
  label,
  note,
  value,
  tone,
}: {
  label: string;
  note?: string;
  value: number;
  /** Tailwind text colour of the number */
  tone: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 first:border-t-0">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {note && <div className="truncate text-xs text-slate-500">{note}</div>}
      </div>
      <b className={`shrink-0 text-base tabular-nums ${tone}`}>{formatNumber(value)}</b>
    </li>
  );
}

/** Products by publish status, incomplete cards (with the reasons) and published-but-sold-out. */
export function CatalogStatusCard({ data }: { data: Today["catalog"] }) {
  const { t } = useTranslation();
  return (
    <WidgetCard
      title={t("today.catalog.title")}
      extra={<CardLink to="/products">{t("today.catalog.products")}</CardLink>}
      className="[&_.ant-card-body]:p-0!"
    >
      <ul className="m-0 list-none p-0">
        <Row label={t("today.catalog.published")} value={data.published} tone="text-brand" />
        <Row label={t("today.catalog.draft")} value={data.draft} tone="text-brand" />
        <Row label={t("today.catalog.review")} value={data.review} tone="text-amber-700" />
        <Row
          label={t("today.catalog.incomplete")}
          note={t("today.catalog.incompleteNote", {
            translation: formatNumber(data.noTranslation),
            image: formatNumber(data.noImage),
            characteristics: formatNumber(data.noCharacteristics),
          })}
          value={data.incomplete}
          tone="text-amber-700"
        />
        <Row label={t("today.catalog.outOfStock")} value={data.outOfStock} tone="text-red-600" />
      </ul>
    </WidgetCard>
  );
}
