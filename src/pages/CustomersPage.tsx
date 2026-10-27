import { App, Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  ActiveFilters,
  clearChip,
  countFilters,
  CUSTOMER_API,
  CustomerEditor,
  CustomerFilterPanel,
  customerColumns,
  CustomersToolbar,
  CustomerStatsCards,
  mergeFilters,
  newSince,
  useCustomersCountQuery,
  useCustomersQuery,
  useCustomerStatsQuery,
  useDeleteCustomer,
  useSetCustomerBlocked,
  type ChipKey,
  type Customer,
  type CustomerFilters,
  type CustomerTab,
  type SavedView,
} from "@/features/customers";
import { getErrorMessage } from "@/shared/api";
import { PlusIcon } from "@/shared/icons";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { RecordsTable } from "@/shared/ui";

/** "Mijozlar": four counters, then one card with the tabs, the filters and the table. */
export function CustomersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<CustomerTab>("all");
  /** the filters of the panel in force (the search box and the tab are apart) */
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  /** "new" — the create form is open */
  const [creating, setCreating] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);
  const stats = useCustomerStatsQuery();
  const newCustomers = useCustomersCountQuery({ from: newSince() });
  // without the backend's `is_deleted` the server would return everyone under this tab
  const deletedWaits = tab === "deleted" && !CUSTOMER_API.deletedCustomers;
  const list = useCustomersQuery(
    {
      filters: { ...mergeFilters(tab, filters), search: debouncedSearch },
      page,
      pageSize,
    },
    !deletedWaits,
  );
  const remove = useDeleteCustomer();
  const block = useSetCustomerBlocked();

  /** every change of the filters goes back to the first page */
  const change = {
    search: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    tab: (next: CustomerTab) => {
      setTab(next);
      setPage(1);
    },
    filters: (next: CustomerFilters) => {
      setFilters(next);
      setPage(1);
    },
  };

  const clearAll = () => {
    setSearch("");
    change.tab("all");
    change.filters({});
  };

  const applyView = (view: SavedView) => {
    change.tab(view.tab);
    change.filters(view.filters);
  };

  const clearChipOf = (key: ChipKey) => {
    if (key === "search") setSearch("");
    else change.filters(clearChip(filters, key));
  };

  const counts: Partial<Record<CustomerTab, number>> = {
    all: stats.data?.total,
    pro: stats.data?.b2b,
    new: newCustomers.data,
    blocked: stats.data?.blocked,
    deleted: stats.data?.deleted,
  };

  const confirmDelete = (item: Customer) =>
    modal.confirm({
      title: t("customers.deleteConfirm"),
      content: item.fullName || item.phone,
      okText: t("common.delete"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        remove.mutateAsync(item.id).then(
          () => message.success(t("common.deleted")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  const toggleBlocked = (item: Customer) =>
    block.mutate(
      { id: item.id, value: !item.isBlocked },
      {
        onSuccess: () => message.success(t("common.saved")),
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.customers")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">
            {t("nav.customers")}{" "}
            {stats.data && (
              <span className="font-medium text-slate-400">{formatNumber(stats.data.total)}</span>
            )}
          </h1>
        </div>
        <Button icon={<PlusIcon />} onClick={() => setCreating(true)}>
          {t("customers.add")}
        </Button>
      </div>

      <CustomerStatsCards stats={stats.data} newCustomers={newCustomers.data} />

      <RecordsTable<Customer>
        toolbarClassName=""
        toolbar={
          <>
            <div className="p-4">
              <CustomersToolbar
                search={search}
                onSearch={change.search}
                tab={tab}
                onTab={change.tab}
                counts={counts}
                panelOpen={panelOpen}
                onTogglePanel={() => setPanelOpen((open) => !open)}
                filterCount={countFilters(filters)}
              />
            </div>
            {panelOpen && (
              <CustomerFilterPanel
                // restarts from the filters in force when a chip or a view changes them
                key={JSON.stringify(filters)}
                value={filters}
                tab={tab}
                onApply={change.filters}
                onApplyView={applyView}
                onReset={() => change.filters({})}
              />
            )}
            <ActiveFilters
              filters={{ ...filters, search: search || undefined }}
              tab={tab}
              total={list.data?.total}
              onClearTab={() => change.tab("all")}
              onClear={clearChipOf}
              onClearAll={clearAll}
            />
          </>
        }
        totalLabel={(shown, total) => `${shown} / ${total} ${t("customers.unit")}`}
        columns={customerColumns(t)}
        items={deletedWaits ? [] : (list.data?.items ?? [])}
        total={deletedWaits ? 0 : (list.data?.total ?? 0)}
        loading={list.isFetching}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        }}
        onOpen={(item) => navigate(`/customers/${item.id}`)}
        rowMenu={(item) => [
          { key: "open", label: t("customers.open") },
          {
            key: "block",
            label: t(item.isBlocked ? "customers.unblock" : "customers.block"),
            danger: !item.isBlocked,
          },
          { key: "delete", label: t("common.delete"), danger: true, separated: true },
        ]}
        onMenuAction={(key, item) =>
          key === "open"
            ? navigate(`/customers/${item.id}`)
            : key === "block"
              ? toggleBlocked(item)
              : confirmDelete(item)
        }
      />
      {deletedWaits && <p className="mt-3 text-sm text-slate-500">{t("customers.soon")}</p>}
      {list.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("customers.loadError")}: {list.error.message}
        </p>
      )}

      {creating && <CustomerEditor id="new" onClose={() => setCreating(false)} />}
    </>
  );
}
