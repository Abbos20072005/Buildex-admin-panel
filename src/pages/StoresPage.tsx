import { PlusIcon, SearchIcon } from "@/shared/icons";
import { Alert, App, Button, Input, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StoreEditor,
  StoresTable,
  STORE_TYPES,
  useBulkSetStoreActive,
  useReorderStores,
  useStoresQuery,
  type Store,
  type StoreType,
} from "@/features/stores";
import { getErrorMessage } from "@/shared/api";
import { useConfirmIfDirty } from "@/shared/form";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { BulkBar, useRowSelection } from "@/shared/ui";

/** "new" — the create form is open; a number — that store is being edited */
type Selected = number | "new" | null;
type Status = "active" | "inactive";

/** Sozlamalar → Do'konlar: the stores (pickup points) — list, add / edit, order, active / inactive. */
export function StoresPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const selection = useRowSelection<Store>();
  const bulk = useBulkSetStoreActive();
  const reorder = useReorderStores();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<StoreType>();
  const [status, setStatus] = useState<Status>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [selected, setSelected] = useState<Selected>(null);
  // opening another record with unsaved edits asks first
  const confirmIfDirty = useConfirmIfDirty();
  const select = (next: Selected) => confirmIfDirty(() => setSelected(next));

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const filters = {
    search: debouncedSearch || undefined,
    type,
    isActive: status === undefined ? undefined : status === "active",
  };
  const stores = useStoresQuery({ filters, page, pageSize });

  const items = stores.data?.items ?? [];
  const total = stores.data?.total ?? 0;
  const current = typeof selected === "number" ? items.find((item) => item.id === selected) : null;
  // the order is the order of ALL stores: only possible when the whole list is on screen
  const filtered = !!debouncedSearch || type !== undefined || status !== undefined;
  const canReorder = !filtered && items.length === total && total > 1;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">
            {t("nav.systemSettings")} / {t("nav.stores")}
          </div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">
            {t("nav.stores")}{" "}
            {stores.data && (
              <span className="font-medium text-slate-400">{formatNumber(total)}</span>
            )}
          </h1>
        </div>
        <Button type="primary" icon={<PlusIcon />} onClick={() => select("new")}>
          {t("stores.add")}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          allowClear
          className="w-72"
          prefix={<SearchIcon className="text-slate-400" />}
          placeholder={t("stores.search")}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select<StoreType | "all">
          className="w-52"
          value={type ?? "all"}
          onChange={(value) => {
            setType(value === "all" ? undefined : value);
            setPage(1);
          }}
          options={[
            { value: "all", label: t("stores.filterType", { value: t("common.all") }) },
            ...STORE_TYPES.map((value) => ({
              value,
              label: t("stores.filterType", { value: t(`stores.types.${value}`) }),
            })),
          ]}
        />
        <Select<Status | "all">
          className="w-52"
          value={status ?? "all"}
          onChange={(value) => {
            setStatus(value === "all" ? undefined : value);
            setPage(1);
          }}
          options={[
            { value: "all", label: t("stores.filterStatus", { value: t("common.all") }) },
            { value: "active", label: t("stores.filterStatus", { value: t("stores.active") }) },
            { value: "inactive", label: t("stores.filterStatus", { value: t("stores.inactive") }) },
          ]}
        />
      </div>

      <BulkBar
        ids={selection.ids}
        mutation={bulk}
        onClear={selection.clear}
        options={[
          { value: true, label: t("bulk.active") },
          { value: false, label: t("bulk.inactive") },
        ]}
      />

      {stores.error && !stores.data ? (
        <Alert
          type="error"
          showIcon
          title={t("stores.loadError")}
          description={getErrorMessage(stores.error)}
          action={
            <Button size="small" onClick={() => void stores.refetch()}>
              {t("common.retry")}
            </Button>
          }
        />
      ) : (
        <StoresTable
          rowSelection={selection.rowSelection}
          stores={items}
          total={total}
          loading={stores.isFetching}
          page={page}
          pageSize={pageSize}
          canReorder={canReorder}
          emptyText={filtered ? t("common.noData") : t("stores.empty")}
          onPageChange={(nextPage, nextSize) => {
            setPage(nextSize !== pageSize ? 1 : nextPage);
            setPageSize(nextSize);
          }}
          onOpen={select}
          onReorder={(ids) =>
            reorder.mutate(ids, { onError: (error) => message.error(getErrorMessage(error)) })
          }
        />
      )}

      {(selected === "new" || current) && (
        <StoreEditor
          key={selected === "new" ? "new" : current?.id}
          store={selected === "new" ? null : (current ?? null)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
