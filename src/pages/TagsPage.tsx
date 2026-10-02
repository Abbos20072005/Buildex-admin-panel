import { App } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BadgeEditor,
  BadgesTable,
  DEFAULT_PAGE_SIZE,
  useBadgesListQuery,
  useReorderBadges,
} from "@/features/badges";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { AttributesSection } from "./AttributesSection";

/** "new" — the create form is open; a number — that badge is open in the side panel */
type Selected = number | "new" | null;

export function TagsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState<Selected>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const badges = useBadgesListQuery({ filters: { search: debouncedSearch }, page, pageSize });
  const reorder = useReorderBadges();

  const items = badges.data?.items ?? [];
  const total = badges.data?.total ?? 0;
  const current = typeof selected === "number" ? items.find((item) => item.id === selected) : null;
  const editorOpen = selected === "new" || !!current;
  // the order is the order of ALL badges — only possible when the whole list is on screen
  const canReorder = debouncedSearch.trim() === "" && items.length === total && total > 1;

  return (
    <>
      <AttributesSection
        titleKey="nav.tags"
        count={badges.data?.total}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={t("badges.search")}
        addLabel={t("badges.add")}
        onAdd={() => setSelected("new")}
      />

      <div
        className={clsx(
          "grid items-start gap-4",
          editorOpen && "xl:grid-cols-[minmax(0,1fr)_440px]",
        )}
      >
        <div className="min-w-0">
          <BadgesTable
            badges={items}
            total={total}
            loading={badges.isFetching}
            page={page}
            pageSize={pageSize}
            selectedId={typeof selected === "number" ? selected : null}
            canReorder={canReorder}
            onPageChange={(nextPage, nextSize) => {
              setPage(nextSize !== pageSize ? 1 : nextPage);
              setPageSize(nextSize);
            }}
            onOpen={setSelected}
            onReorder={(ids) =>
              reorder.mutate(ids, { onError: (error) => message.error(getErrorMessage(error)) })
            }
          />
          {badges.error && (
            <p className="mt-3 text-sm text-red-600">
              {t("badges.loadError")}: {badges.error.message}
            </p>
          )}
        </div>

        {editorOpen && (
          <BadgeEditor
            key={selected === "new" ? "new" : (current?.id ?? "none")}
            badge={selected === "new" ? null : (current ?? null)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </>
  );
}
