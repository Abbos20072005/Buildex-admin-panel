import { PlusIcon, SearchIcon } from "@/shared/icons";
import { App, Button, Input, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AdBlockEditor,
  adBlockColumns,
  useAdBlocksQuery,
  useDeleteAdBlock,
  type AdBlock,
} from "@/features/ad-blocks";
import { getErrorMessage } from "@/shared/api";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { RecordsTable } from "@/shared/ui";

type Visibility = "visible" | "hidden";
type BrandFilter = "with" | "without";

/** "Reklama bloklari": home-page product sections with their campaign pages. */
export function AdBlocksPage() {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<Visibility>();
  const [brand, setBrand] = useState<BrandFilter>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  /** "new" — the create form is open; a number — that block is being edited */
  const [selected, setSelected] = useState<number | "new" | null>(null);

  const list = useAdBlocksQuery({
    filters: {
      search: useDebouncedValue(search, 300),
      isVisible: visibility && visibility === "visible",
      hasBrand: brand && brand === "with",
    },
    page,
    pageSize,
  });
  const remove = useDeleteAdBlock();

  const confirmDelete = (item: AdBlock) =>
    modal.confirm({
      title: t("adBlocks.deleteConfirm"),
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

  const resetPage = () => setPage(1);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.contents")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">
            {t("nav.adBlocks")}{" "}
            {list.data && (
              <span className="font-medium text-slate-400">{formatNumber(list.data.total)}</span>
            )}
          </h1>
        </div>
        <Button type="primary" icon={<PlusIcon />} onClick={() => setSelected("new")}>
          {t("adBlocks.add")}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          allowClear
          className="w-72"
          prefix={<SearchIcon className="text-slate-400" />}
          placeholder={t("adBlocks.search")}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetPage();
          }}
        />
        <Select<Visibility>
          allowClear
          className="w-44"
          placeholder={t("adBlocks.columns.status")}
          value={visibility}
          onChange={(value) => {
            setVisibility(value);
            resetPage();
          }}
          options={[
            { value: "visible", label: t("adBlocks.visible") },
            { value: "hidden", label: t("adBlocks.hidden") },
          ]}
        />
        <Select<BrandFilter>
          allowClear
          className="w-52"
          placeholder={t("adBlocks.columns.brand")}
          value={brand}
          onChange={(value) => {
            setBrand(value);
            resetPage();
          }}
          options={[
            { value: "with", label: t("adBlocks.withBrand") },
            { value: "without", label: t("adBlocks.withoutBrand") },
          ]}
        />
      </div>

      <RecordsTable<AdBlock>
        columns={adBlockColumns(t)}
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
          {t("adBlocks.loadError")}: {list.error.message}
        </p>
      )}

      {selected !== null && (
        <AdBlockEditor key={selected} id={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
