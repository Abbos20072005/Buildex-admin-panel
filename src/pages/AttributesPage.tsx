import { useState } from "react";
import { useConfirmIfDirty } from "@/shared/form";
import { useTranslation } from "react-i18next";
import { BulkBar, useRowSelection } from "@/shared/ui";
import {
  AttributeEditor,
  AttributesTable,
  DEFAULT_PAGE_SIZE,
  useAttributesListQuery,
  useBulkSetAttributeActive,
  type Attribute,
} from "@/features/attributes";
import { clsx } from "@/shared/lib/clsx";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { AttributesSection } from "./AttributesSection";

/** "new" — the create form is open; a number — that attribute is open in the side panel */
type Selected = number | "new" | null;

export function AttributesPage() {
  const { t } = useTranslation();
  const selection = useRowSelection<Attribute>();
  const bulk = useBulkSetAttributeActive();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState<Selected>(null);
  // opening another record (or "add") with unsaved edits in the panel asks first
  const confirmIfDirty = useConfirmIfDirty();
  const select = (next: Selected) => confirmIfDirty(() => setSelected(next));

  const debouncedSearch = useDebouncedValue(search, 300);
  const attributes = useAttributesListQuery({
    filters: { search: debouncedSearch },
    page,
    pageSize,
  });
  const items = attributes.data?.items ?? [];
  const current = typeof selected === "number" ? items.find((item) => item.id === selected) : null;
  const editorOpen = selected === "new" || !!current;

  return (
    <>
      <AttributesSection
        titleKey="nav.characteristics"
        count={attributes.data?.total}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={t("attributes.search")}
        addLabel={t("attributes.add")}
        onAdd={() => select("new")}
      />

      <div
        className={clsx(
          "grid items-start gap-4",
          editorOpen && "xl:grid-cols-[minmax(0,1fr)_440px]",
        )}
      >
        <div className="min-w-0">
          <BulkBar
            ids={selection.ids}
            mutation={bulk}
            onClear={selection.clear}
            options={[
              { value: true, label: t("bulk.active") },
              { value: false, label: t("bulk.inactive") },
            ]}
          />

          <AttributesTable
            rowSelection={selection.rowSelection}
            attributes={items}
            total={attributes.data?.total ?? 0}
            loading={attributes.isFetching}
            page={page}
            pageSize={pageSize}
            selectedId={typeof selected === "number" ? selected : null}
            onPageChange={(nextPage, nextSize) => {
              setPage(nextSize !== pageSize ? 1 : nextPage);
              setPageSize(nextSize);
            }}
            onOpen={select}
          />
          {attributes.error && (
            <p className="mt-3 text-sm text-red-600">
              {t("attributes.loadError")}: {attributes.error.message}
            </p>
          )}
        </div>

        {editorOpen && (
          <AttributeEditor
            key={selected === "new" ? "new" : (current?.id ?? "none")}
            attribute={selected === "new" ? null : (current ?? null)}
            onClose={() => setSelected(null)}
            onSaved={(saved) => setSelected(saved.id)}
          />
        )}
      </div>
    </>
  );
}
