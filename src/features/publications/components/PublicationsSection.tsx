import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { App, Button, DatePicker, Input, type TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage, type Page } from "@/shared/api";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { RecordsTable } from "@/shared/ui";
import type { PublicationKind, PublicationListParams } from "../model/types";

interface Props<T extends { id: number }> {
  kind: PublicationKind;
  useList: (params: PublicationListParams) => UseQueryResult<Page<T>>;
  useRemove: () => UseMutationResult<void, Error, number>;
  columns: TableColumnsType<T>;
  /** text shown in the "delete?" dialog */
  nameOf: (item: T) => string;
  renderEditor: (id: number | "new", onClose: () => void) => ReactNode;
}

const DATE_FORMAT = "YYYY-MM-DD";

/** One tab of the page: search + date range + table + the editor drawer. */
export function PublicationsSection<T extends { id: number }>({
  kind,
  useList,
  useRemove,
  columns,
  nameOf,
  renderEditor,
}: Props<T>) {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const [search, setSearch] = useState("");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  /** "new" — the create form is open; a number — that record is being edited */
  const [selected, setSelected] = useState<number | "new" | null>(null);

  const list = useList({
    filters: {
      search: useDebouncedValue(search, 300),
      from: range?.[0]?.format(DATE_FORMAT),
      to: range?.[1]?.format(DATE_FORMAT),
    },
    page,
    pageSize,
  });
  const remove = useRemove();

  const confirmDelete = (item: T) =>
    modal.confirm({
      title: t(`publications.deleteConfirm.${kind}`),
      content: nameOf(item),
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Input
            allowClear
            className="w-72"
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder={t(`publications.search.${kind}`)}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <DatePicker.RangePicker
            allowClear
            value={range}
            onChange={(value) => {
              setRange(value);
              setPage(1);
            }}
          />
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setSelected("new")}>
          {t(`publications.add.${kind}`)}
        </Button>
      </div>

      <RecordsTable<T>
        columns={columns}
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
          {t("publications.loadError")}: {list.error.message}
        </p>
      )}

      {selected !== null && renderEditor(selected, () => setSelected(null))}
    </>
  );
}
