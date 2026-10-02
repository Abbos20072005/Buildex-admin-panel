import { App } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BulkActionsBar,
  OrderModal,
  OrdersFilterPanel,
  OrdersTable,
  OrdersToolbar,
  OrderStatusTabs,
  useBulkUpdateOrderStatus,
  useOrderListState,
  useOrdersExport,
  useOrdersQuery,
  useOrderStatsQuery,
  type OrderStatus,
} from "@/features/orders";

export function OrdersPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const state = useOrderListState();
  const { tab, page, pageSize, sort, filters, listFilters, activeFilterCount } = state;

  const orders = useOrdersQuery({ filters: listFilters, page, pageSize, sort });
  const stats = useOrderStatsQuery(filters);
  const bulkUpdate = useBulkUpdateOrderStatus();
  const exporter = useOrdersExport();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);

  const changeSelectedStatus = (status: OrderStatus) =>
    bulkUpdate.mutate(
      { ids: selectedIds, status },
      {
        onSuccess: ({ succeeded, failed }) => {
          if (succeeded) message.success(t("orders.toast.updated", { count: succeeded }));
          if (failed) message.error(t("orders.toast.updateFailed", { count: failed }));
          setSelectedIds([]);
        },
      },
    );

  return (
    <>
      <OrdersToolbar
        total={orders.data?.total}
        filtersOpen={filtersOpen}
        activeFilterCount={activeFilterCount}
        exportLabel={
          exporter.progress
            ? t("orders.exporting", {
                loaded: exporter.progress.loaded,
                total: exporter.progress.total,
              })
            : null
        }
        onToggleFilters={() => setFiltersOpen((open) => !open)}
        onExport={() => exporter.run(listFilters)}
      />

      <OrderStatusTabs
        value={tab}
        stats={stats.data}
        onChange={(next) => {
          setSelectedIds([]);
          state.setTab(next);
        }}
      />

      {filtersOpen && <OrdersFilterPanel state={state} />}

      {selectedIds.length > 0 && (
        <BulkActionsBar
          count={selectedIds.length}
          loading={bulkUpdate.isPending}
          onChangeStatus={changeSelectedStatus}
          onClear={() => setSelectedIds([])}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <OrdersTable
          orders={orders.data?.items ?? []}
          total={orders.data?.total ?? 0}
          loading={orders.isFetching}
          page={page}
          pageSize={pageSize}
          sort={sort}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onPageChange={state.setPage}
          onSortChange={state.setSort}
          onOpen={setOpenOrderId}
        />
      </div>

      {orders.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("orders.toast.loadError")}: {orders.error.message}
        </p>
      )}

      <OrderModal orderId={openOrderId} onClose={() => setOpenOrderId(null)} />
    </>
  );
}
