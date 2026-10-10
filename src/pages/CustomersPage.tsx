import { App, Button, DatePicker, Input, Select } from "antd";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CUSTOMER_ROLES,
  customerColumns,
  CustomerEditor,
  CustomerStatsCards,
  useCustomersQuery,
  useCustomerStatsQuery,
  useDeleteCustomer,
  type Customer,
  type CustomerFilters,
  type CustomerRole,
  useBulkSetCustomerBlocked,
} from "@/features/customers";
import { getErrorMessage } from "@/shared/api";
import { PlusIcon, SearchIcon } from "@/shared/icons";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { RecordsTable, BulkBar, useRowSelection } from "@/shared/ui";

type RoleFilter = "all" | CustomerRole;
type StateFilter = "all" | "active" | "verified" | "unverified" | "blocked";
type OrdersFilter = "all" | "with" | "without";

const STATES: StateFilter[] = ["all", "active", "verified", "unverified", "blocked"];
const DATE_FORMAT = "YYYY-MM-DD";

/** The server-side filters of the chosen state. */
const stateToFilters = (state: StateFilter): CustomerFilters =>
  ({
    all: {},
    active: { isActive: true },
    verified: { verified: true },
    unverified: { verified: false },
    blocked: { isBlocked: true },
  })[state];

/** "Mijozlar": counters, then one card with the filters and the table. */
export function CustomersPage() {
  const { t } = useTranslation();
  const selection = useRowSelection<Customer>();
  const bulk = useBulkSetCustomerBlocked();
  const { message, modal } = App.useApp();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [state, setState] = useState<StateFilter>("all");
  const [orders, setOrders] = useState<OrdersFilter>("all");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  /** "new" — the create form is open; a number — that customer is being edited */
  const [selected, setSelected] = useState<number | "new" | null>(null);

  const stats = useCustomerStatsQuery();
  const list = useCustomersQuery({
    filters: {
      search: useDebouncedValue(search, 300),
      role: role === "all" ? undefined : role,
      hasOrders: orders === "all" ? undefined : orders === "with",
      from: range?.[0]?.format(DATE_FORMAT),
      to: range?.[1]?.format(DATE_FORMAT),
      ...stateToFilters(state),
    },
    page,
    pageSize,
  });
  const remove = useDeleteCustomer();

  /** every filter change goes back to the first page */
  const filter =
    <V,>(set: (value: V) => void) =>
    (value: V) => {
      set(value);
      setPage(1);
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

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 text-2xl font-bold tracking-tight">
          {t("nav.customers")}{" "}
          {list.data && (
            <span className="font-medium text-slate-400">{formatNumber(list.data.total)}</span>
          )}
        </h1>
        <Button type="primary" icon={<PlusIcon />} onClick={() => setSelected("new")}>
          {t("customers.add")}
        </Button>
      </div>

      <CustomerStatsCards stats={stats.data} />

      <BulkBar
        ids={selection.ids}
        mutation={bulk}
        onClear={selection.clear}
        options={[
          { value: false, label: t("bulk.active") },
          { value: true, label: t("bulk.blocked") },
        ]}
      />

      <RecordsTable<Customer>
        rowSelection={selection.rowSelection}
        toolbar={
          <>
            <Input
              allowClear
              className="w-72"
              prefix={<SearchIcon className="text-slate-400" />}
              placeholder={t("customers.search")}
              value={search}
              onChange={(event) => filter(setSearch)(event.target.value)}
            />
            <Select<RoleFilter>
              className="w-44"
              value={role}
              onChange={filter(setRole)}
              options={(["all", ...CUSTOMER_ROLES] as RoleFilter[]).map((value) => ({
                value,
                label: t("customers.filterRole", {
                  value: value === "all" ? t("common.all") : t(`role.${value}`),
                }),
              }))}
            />
            <Select<StateFilter>
              className="w-52"
              value={state}
              onChange={filter(setState)}
              options={STATES.map((value) => ({
                value,
                label: t("customers.filterState", {
                  value: value === "all" ? t("common.all") : t(`customers.stateFilter.${value}`),
                }),
              }))}
            />
            <Select<OrdersFilter>
              className="w-52"
              value={orders}
              onChange={filter(setOrders)}
              options={(["all", "with", "without"] as OrdersFilter[]).map((value) => ({
                value,
                label: t("customers.filterOrders", {
                  value: value === "all" ? t("common.all") : t(`customers.ordersFilter.${value}`),
                }),
              }))}
            />
            <DatePicker.RangePicker allowClear value={range} onChange={filter(setRange)} />
          </>
        }
        totalLabel={(shown, total) => `${shown} / ${total} ${t("customers.unit")}`}
        columns={customerColumns(t)}
        items={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        loading={list.isFetching}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        }}
        onOpen={(item) => setSelected(item.id)}
        onDelete={confirmDelete}
      />
      {list.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("customers.loadError")}: {list.error.message}
        </p>
      )}

      {selected !== null && (
        <CustomerEditor key={selected} id={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
