import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { PUBLICATION_KINDS, PublicationsTab, type PublicationKind } from "@/features/publications";
import { clsx } from "@/shared/lib/clsx";

const isKind = (value: string | null): value is PublicationKind =>
  PUBLICATION_KINDS.includes(value as PublicationKind);

/** "Yangiliklar": news, articles and videos of the site, one tab each (`?tab=articles`). */
export function PublicationsPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab: PublicationKind = isKind(tabParam) ? tabParam : "news";

  return (
    <>
      <div className="mb-4">
        <div className="text-xs text-slate-500">{t("nav.contents")}</div>
        <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.news")}</h1>
      </div>

      <nav className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
        {PUBLICATION_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => setParams({ tab: kind })}
            className={clsx(
              "cursor-pointer rounded-lg border-0 px-4 py-1.5 text-sm font-semibold transition-colors",
              tab === kind
                ? "bg-brand text-white"
                : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {t(`publications.tabs.${kind}`)}
          </button>
        ))}
      </nav>

      {/* key: every tab starts with its own search, dates and page */}
      <PublicationsTab key={tab} kind={tab} />
    </>
  );
}
