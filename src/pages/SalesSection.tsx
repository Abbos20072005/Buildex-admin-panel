import { SearchIcon } from "@/shared/icons";
import { App, Input, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  saleColumns,
  SaleEditor,
  useBulkSetSaleVisible,
  useDeleteSale,
  useSalesQuery,
  type Sale,
} from "@/features/sales";
import { getErrorMessage } from "@/shared/api";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { BulkBar, RecordsTable, useRowSelection } from "@/shared/ui";

type Visibility = "visible" | "hidden";

interface Props {
  /** "new" — the create form is open; a number — that sale is being edited */
  selected: number | "new" | null;
  onSelect: (selected: number | "new" | null) => void;
}

/** The "Aksiyalar" (sales) list of the Karusellar page. */
export function SalesSection({ selected, onSelect }: Props) {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const selection = useRowSelection<Sale>();
  const bulk = useBulkSetSaleVisible();

  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<Visibility>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const list = useSalesQuery({
    filters: {
      search: useDebouncedValue(search, 300),
      isVisible: visibility && visibility === "visible",
    },
    page,
    pageSize,
  });
  const remove = useDeleteSale();

  const confirmDelete = (item: Sale) =>
    modal.confirm({
      title: t("sales.deleteConfirm"),
      content: item.name,
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
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          allowClear
          className="w-72"
          prefix={<SearchIcon className="text-slate-400" />}
          placeholder={t("sales.search")}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select<Visibility>
          allowClear
          className="w-44"
          placeholder={t("sales.columns.visible")}
          value={visibility}
          onChange={(value) => {
            setVisibility(value);
            setPage(1);
          }}
          options={[
            { value: "visible", label: t("sales.visible") },
            { value: "hidden", label: t("sales.hidden") },
          ]}
        />
      </div>

      <BulkBar
        ids={selection.ids}
        mutation={bulk}
        onClear={selection.clear}
        options={[
          { value: true, label: t("bulk.visible") },
          { value: false, label: t("bulk.hidden") },
        ]}
      />

      <RecordsTable<Sale>
        rowSelection={selection.rowSelection}
        columns={saleColumns(t)}
        items={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        loading={list.isFetching}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        }}
        onOpen={(item) => onSelect(item.id)}
        onDelete={confirmDelete}
      />
      {list.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("sales.loadError")}: {list.error.message}
        </p>
      )}

      {selected !== null && (
        <SaleEditor key={selected} id={selected} onClose={() => onSelect(null)} />
      )}
    </>
  );
}
