import { App } from "antd";
import { useState } from "react";
import { useConfirmIfDirty } from "@/shared/form";
import { useTranslation } from "react-i18next";
import { BulkBar, useRowSelection } from "@/shared/ui";
import {
  DEFAULT_PAGE_SIZE,
  ModelEditor,
  ModelsTable,
  useDeleteModel,
  useModelsListQuery,
  type ProductModel,
  useBulkSetModelActive,
} from "@/features/models";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { AttributesSection } from "./AttributesSection";

/** "new" — the create form is open; a number — that model is open in the side panel */
type Selected = number | "new" | null;

export function ModelsPage() {
  const { t } = useTranslation();
  const selection = useRowSelection<ProductModel>();
  const bulk = useBulkSetModelActive();
  const { message, modal } = App.useApp();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState<Selected>(null);
  // opening another record (or "add") with unsaved edits in the panel asks first
  const confirmIfDirty = useConfirmIfDirty();
  const select = (next: Selected) => confirmIfDirty(() => setSelected(next));

  const models = useModelsListQuery({
    filters: { search: useDebouncedValue(search, 300) },
    page,
    pageSize,
  });
  const remove = useDeleteModel();

  const items = models.data?.items ?? [];
  const current = typeof selected === "number" ? items.find((item) => item.id === selected) : null;
  const editorOpen = selected === "new" || !!current;

  const confirmDelete = (model: ProductModel) =>
    modal.confirm({
      title: t("models.deleteConfirm"),
      content: model.name,
      okText: t("common.delete"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        remove.mutateAsync(model.id).then(
          () => message.success(t("models.deleted")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  return (
    <>
      <AttributesSection
        titleKey="nav.models"
        count={models.data?.total}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={t("models.search")}
        addLabel={t("models.add")}
        onAdd={() => select("new")}
      />

      <div
        className={clsx(
          "grid items-start gap-4",
          editorOpen && "xl:grid-cols-[minmax(0,1fr)_420px]",
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

          <ModelsTable
            rowSelection={selection.rowSelection}
            models={items}
            total={models.data?.total ?? 0}
            loading={models.isFetching}
            page={page}
            pageSize={pageSize}
            selectedId={typeof selected === "number" ? selected : null}
            onPageChange={(nextPage, nextSize) => {
              setPage(nextSize !== pageSize ? 1 : nextPage);
              setPageSize(nextSize);
            }}
            onOpen={select}
            onDelete={confirmDelete}
          />
          {models.error && (
            <p className="mt-3 text-sm text-red-600">
              {t("models.loadError")}: {models.error.message}
            </p>
          )}
        </div>

        {editorOpen && (
          <ModelEditor
            key={selected === "new" ? "new" : (current?.id ?? "none")}
            model={selected === "new" ? null : (current ?? null)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </>
  );
}
