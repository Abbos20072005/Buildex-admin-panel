import { App } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CategoriesTable,
  CategoryEditor,
  nodeKey,
  useCategoryRows,
  useReorderCategories,
  type CategoryEditorTarget,
  type CategoryItem,
} from "@/features/categories";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { AttributesSection } from "./AttributesSection";

export function CategoriesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [target, setTarget] = useState<CategoryEditorTarget | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { rows, loading, error } = useCategoryRows(expanded, debouncedSearch);
  const reorder = useReorderCategories();

  const toggle = (item: CategoryItem) =>
    setExpanded((current) => {
      const next = new Set(current);
      const key = nodeKey(item);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    <>
      <AttributesSection
        titleKey="nav.categories"
        count={rows.length > 0 ? rows.length : undefined}
        search={search}
        onSearch={setSearch}
        searchPlaceholder={t("categories.search")}
        addLabel={t("categories.add")}
        onAdd={() => setTarget("create")}
      />

      <div
        className={clsx("grid items-start gap-4", target && "xl:grid-cols-[minmax(0,1fr)_480px]")}
      >
        <div className="min-w-0">
          <CategoriesTable
            rows={rows}
            loading={loading}
            searching={debouncedSearch.trim() !== ""}
            expanded={expanded}
            selectedKey={target && target !== "create" ? nodeKey(target) : null}
            onToggle={toggle}
            onOpen={setTarget}
            onReorder={(item, ids) =>
              reorder.mutate(
                { level: item.level, parentId: item.level === 1 ? null : item.parentId, ids },
                { onError: (err) => message.error(getErrorMessage(err)) },
              )
            }
          />
          {error && (
            <p className="mt-3 text-sm text-red-600">
              {t("categories.loadError")}: {getErrorMessage(error)}
            </p>
          )}
        </div>

        {target && (
          <CategoryEditor
            key={target === "create" ? "create" : nodeKey(target)}
            target={target}
            onClose={() => setTarget(null)}
          />
        )}
      </div>
    </>
  );
}
