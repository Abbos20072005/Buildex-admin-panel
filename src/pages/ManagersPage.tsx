import { App, Button, Input, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  managerColumns,
  ManagerEditor,
  useDeleteManager,
  useManagersQuery,
  type Manager,
} from "@/features/managers";
import { getErrorMessage } from "@/shared/api";
import { PlusIcon, SearchIcon } from "@/shared/icons";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { RecordsTable } from "@/shared/ui";

type Status = "all" | "active" | "inactive";

/** "Menejerlar": the people orders are assigned to — one card with the filters and the table. */
export function ManagersPage() {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  /** "new" — the create form is open; a manager — that one is being edited */
  const [selected, setSelected] = useState<Manager | "new" | null>(null);

  const list = useManagersQuery({
    filters: {
      search: useDebouncedValue(search, 300),
      isActive: status === "all" ? undefined : status === "active",
    },
    page,
    pageSize,
  });
  const remove = useDeleteManager();

  const confirmDelete = (item: Manager) =>
    modal.confirm({
      title: t("managers.deleteConfirm"),
      content: item.fullName,
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
          {t("nav.managers")}{" "}
          {list.data && (
            <span className="font-medium text-slate-400">{formatNumber(list.data.total)}</span>
          )}
        </h1>
        <Button type="primary" icon={<PlusIcon />} onClick={() => setSelected("new")}>
          {t("managers.add")}
        </Button>
      </div>

      <RecordsTable<Manager>
        toolbar={
          <>
            <Input
              allowClear
              className="w-72"
              prefix={<SearchIcon className="text-slate-400" />}
              placeholder={t("managers.search")}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Select<Status>
              className="w-48"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: t("managers.filterStatus", { value: t("common.all") }) },
                {
                  value: "active",
                  label: t("managers.filterStatus", { value: t("managers.statusActive") }),
                },
                {
                  value: "inactive",
                  label: t("managers.filterStatus", { value: t("managers.statusInactive") }),
                },
              ]}
            />
          </>
        }
        totalLabel={(shown, total) => `${shown} / ${total} ${t("managers.unit")}`}
        columns={managerColumns(t)}
        items={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        loading={list.isFetching}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        }}
        onOpen={setSelected}
        onDelete={confirmDelete}
      />
      {list.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("managers.loadError")}: {list.error.message}
        </p>
      )}

      {selected !== null && (
        <ManagerEditor
          key={selected === "new" ? "new" : selected.id}
          item={selected === "new" ? null : selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
