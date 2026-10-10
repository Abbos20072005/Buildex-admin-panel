import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BulkBar, useRowSelection } from "@/shared/ui";
import { useNavigate } from "react-router-dom";
import {
  ProductsFilterPanel,
  ProductsGrid,
  ProductsTable,
  ProductsToolbar,
  ProductTabs,
  PUBLISH_STATUSES,
  useBulkSetPublishStatus,
  useProductListState,
  useProductsExport,
  useProductsQuery,
  useProductTabCountsQuery,
  type Product,
} from "@/features/products";

export function ProductsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const state = useProductListState();
  const { tab, view, page, pageSize, sort, filters, listFilters, activeFilterCount } = state;

  const products = useProductsQuery({ filters: listFilters, page, pageSize, sort });
  const tabCounts = useProductTabCountsQuery(filters);
  const exporter = useProductsExport();
  const selection = useRowSelection<Product>();
  const bulk = useBulkSetPublishStatus();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const listProps = {
    products: products.data?.items ?? [],
    total: products.data?.total ?? 0,
    loading: products.isFetching,
    page,
    pageSize,
    onPageChange: state.setPage,
    onOpen: (id: number) => navigate(`/products/${id}`),
  };

  return (
    <>
      <ProductsToolbar
        total={tabCounts.data?.all}
        view={view}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        exportLabel={
          exporter.progress
            ? t("products.exporting", {
                loaded: exporter.progress.loaded,
                total: exporter.progress.total,
              })
            : null
        }
        onViewChange={state.setView}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
        onExport={() => exporter.run(listFilters)}
      />

      <ProductTabs value={tab} counts={tabCounts.data} onChange={state.setTab} />

      {filtersOpen && <ProductsFilterPanel state={state} />}

      {view === "table" && (
        <BulkBar
          ids={selection.ids}
          mutation={bulk}
          onClear={selection.clear}
          options={PUBLISH_STATUSES.map((status) => ({
            value: status,
            label: t(`publishStatus.${status}`),
          }))}
        />
      )}

      {view === "cards" ? (
        <ProductsGrid {...listProps} />
      ) : (
        <ProductsTable
          {...listProps}
          rowSelection={selection.rowSelection}
          sort={sort}
          onSortChange={state.setSort}
        />
      )}

      {products.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("products.toast.loadError")}: {products.error.message}
        </p>
      )}
    </>
  );
}
