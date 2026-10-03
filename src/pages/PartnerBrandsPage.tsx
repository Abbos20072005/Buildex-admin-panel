import { App } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PartnerBrandEditor,
  PartnerBrandsTable,
  useDeletePartnerBrand,
  usePartnerBrandsQuery,
  type PartnerBrand,
} from "@/features/partner-brands";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { AttributesSection } from "./AttributesSection";

/** "new" — the create form is open; a number — that partner brand is open in the side panel */
type Selected = number | "new" | null;

export function PartnerBrandsPage() {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<Selected>(null);

  const list = usePartnerBrandsQuery({
    filters: { search: useDebouncedValue(search, 300) },
    page,
    pageSize,
  });
  const remove = useDeletePartnerBrand();

  const items = list.data?.items ?? [];
  const current = typeof selected === "number" ? items.find((item) => item.id === selected) : null;
  const editorOpen = selected === "new" || !!current;

  const confirmDelete = (item: PartnerBrand) =>
    modal.confirm({
      title: t("partnerBrands.deleteConfirm"),
      content: item.name,
      okText: t("common.delete"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        remove.mutateAsync(item.id).then(
          () => message.success(t("partnerBrands.deleted")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  return (
    <>
      <AttributesSection
        titleKey="nav.partnerBrands"
        count={list.data?.total}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={t("partnerBrands.search")}
        addLabel={t("partnerBrands.add")}
        onAdd={() => setSelected("new")}
      />

      <div
        className={clsx(
          "grid items-start gap-4",
          editorOpen && "xl:grid-cols-[minmax(0,1fr)_400px]",
        )}
      >
        <div className="min-w-0">
          <PartnerBrandsTable
            items={items}
            total={list.data?.total ?? 0}
            loading={list.isFetching}
            page={page}
            pageSize={pageSize}
            selectedId={typeof selected === "number" ? selected : null}
            onPageChange={(nextPage, nextSize) => {
              setPage(nextSize !== pageSize ? 1 : nextPage);
              setPageSize(nextSize);
            }}
            onOpen={setSelected}
            onDelete={confirmDelete}
          />
          {list.error && (
            <p className="mt-3 text-sm text-red-600">
              {t("partnerBrands.loadError")}: {list.error.message}
            </p>
          )}
        </div>

        {editorOpen && (
          <PartnerBrandEditor
            key={selected === "new" ? "new" : (current?.id ?? "none")}
            item={selected === "new" ? null : (current ?? null)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </>
  );
}
