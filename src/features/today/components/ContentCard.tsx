import { useTranslation } from "react-i18next";
import { WidgetCard } from "@/shared/ui";
import type { Today } from "../model/types";

/** Banners about to expire and notifications still in draft (the "content" part of attention). */
export function ContentCard({ data }: { data: Today["attention"] }) {
  const { t } = useTranslation();
  const items = data.items.filter((item) => item.group === "content");

  return (
    <WidgetCard title={t("today.content.title")} className="[&_.ant-card-body]:p-0!">
      {items.length === 0 ? (
        <p className="m-0 px-5 py-8 text-center text-sm text-slate-500">
          {t("today.attention.allGood")}
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 first:border-t-0"
            >
              <div className="min-w-0">
                <div className="text-sm">
                  {t(`today.attention.keys.${item.key}`, {
                    count: item.count,
                    days: data.bannerDays,
                  })}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {item.objects
                    .map((object) => object.name)
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <b className="shrink-0 text-base text-amber-700 tabular-nums">{item.count}</b>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
