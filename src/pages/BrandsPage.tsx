import { App } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BrandEditor,
  BrandsTable,
  DEFAULT_PAGE_SIZE,
  useBrandsListQuery,
  useSetBrandVisible,
  type Brand,
} from "@/features/brands";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { AttributesSection } from "./AttributesSection";

/** "new" — the create form is open; a number — that brand is open in the side panel */
type Selected = number | "new" | null;

export function BrandsPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState<Selected>(null);

  const brands = useBrandsListQuery({
    filters: { search: useDebouncedValue(search, 300) },
    page,
    pageSize,
  });
  const setVisible = useSetBrandVisible();

  const items = brands.data?.items ?? [];
  const current = typeof selected === "number" ? items.find((item) => item.id === selected) : null;
  const editorOpen = selected === "new" || !!current;

  const toggleVisible = (brand: Brand, isVisible: boolean) =>
    setVisible.mutate(
      { id: brand.id, isVisible },
      { onError: (error) => message.error(getErrorMessage(error)) },
    );

  return (
    <>
      <AttributesSection
        titleKey="nav.brands"
        count={brands.data?.total}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={t("brands.search")}
        addLabel={t("brands.add")}
        onAdd={() => setSelected("new")}
      />

      <div
        className={clsx(
          "grid items-start gap-4",
          editorOpen && "xl:grid-cols-[minmax(0,1fr)_440px]",
        )}
      >
        <div className="min-w-0">
          <BrandsTable
            brands={items}
            total={brands.data?.total ?? 0}
            loading={brands.isFetching}
            page={page}
            pageSize={pageSize}
            selectedId={typeof selected === "number" ? selected : null}
            togglingId={setVisible.isPending ? (setVisible.variables?.id ?? null) : null}
            onPageChange={(nextPage, nextSize) => {
              setPage(nextSize !== pageSize ? 1 : nextPage);
              setPageSize(nextSize);
            }}
            onOpen={setSelected}
            onToggleVisible={toggleVisible}
          />
          {brands.error && (
            <p className="mt-3 text-sm text-red-600">
              {t("brands.loadError")}: {brands.error.message}
            </p>
          )}
        </div>

        {editorOpen && (
          <BrandEditor
            key={selected === "new" ? "new" : (current?.id ?? "none")}
            brand={selected === "new" ? null : (current ?? null)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </>
  );
}
