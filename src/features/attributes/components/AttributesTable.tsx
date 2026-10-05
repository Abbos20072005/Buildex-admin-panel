import { CheckIcon } from "@/shared/icons";
import { Table, Tag, type TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "../model/constants";
import type { Attribute } from "../model/types";
import { previewList } from "../lib/preview";
import { ValueTypeTag } from "./AttributeBits";

interface Props {
  attributes: Attribute[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  selectedId: number | null;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (id: number) => void;
}

const dash = <span className="text-slate-300">—</span>;

export function AttributesTable({
  attributes,
  total,
  loading,
  page,
  pageSize,
  selectedId,
  onPageChange,
  onOpen,
}: Props) {
  const { t } = useTranslation();

  const columns: TableColumnsType<Attribute> = [
    {
      key: "name",
      title: t("attributes.columns.name"),
      width: 220,
      render: (_, attribute) => (
        <div className="leading-tight">
          <div className="font-semibold">
            {attribute.names.uz || (
              <span className="text-red-600">{t("attributes.missing.uz")}</span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {attribute.names.ru || (
              <span className="text-red-600">{t("attributes.missing.ru")}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      title: t("attributes.columns.type"),
      width: 110,
      render: (_, attribute) => <ValueTypeTag type={attribute.valueType} />,
    },
    {
      key: "unit",
      title: t("attributes.columns.unit"),
      width: 90,
      render: (_, attribute) =>
        attribute.unit ? <span className="font-mono text-[13px]">{attribute.unit}</span> : dash,
    },
    {
      key: "values",
      title: t("attributes.columns.values"),
      width: 260,
      render: (_, attribute) => {
        const values =
          attribute.valueType === "list"
            ? attribute.options.map((option) => option.uz || option.ru)
            : attribute.valueType === "boolean"
              ? [t("attributes.yes"), t("attributes.no")]
              : [];
        return values.length ? (
          <span className="text-[13px] text-slate-600">{previewList(values)}</span>
        ) : (
          dash
        );
      },
    },
    {
      key: "filter",
      title: t("attributes.columns.filter"),
      width: 70,
      align: "center",
      render: (_, attribute) =>
        attribute.isFilterable ? <CheckIcon className="text-brand" /> : dash,
    },
    {
      key: "categories",
      title: t("attributes.columns.categories"),
      width: 260,
      render: (_, attribute) =>
        attribute.categories.length ? (
          <span className="text-[13px] text-slate-600">
            {previewList(
              attribute.categories.map((category) => category.name),
              2,
            )}
          </span>
        ) : (
          dash
        ),
    },
    {
      key: "status",
      title: t("attributes.columns.status"),
      width: 100,
      render: (_, attribute) => (
        <Tag
          color={attribute.isActive ? "green" : "gold"}
          variant="filled"
          className="m-0 font-semibold"
        >
          {t(attribute.isActive ? "attributes.active" : "attributes.draft")}
        </Tag>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<Attribute>
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={attributes}
        loading={loading}
        scroll={{ x: 1000 }}
        onRow={(attribute) => ({
          className: clsx("cursor-pointer", attribute.id === selectedId && "bg-brand/5"),
          onClick: () => onOpen(attribute.id),
        })}
        locale={{ emptyText: <div className="py-10 text-slate-500">{t("common.noData")}</div> }}
        pagination={{
          current: page,
          pageSize: pageSize || DEFAULT_PAGE_SIZE,
          total,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZES,
          showTotal: (count, [from, to]) => `${from}–${to} / ${count}`,
          onChange: onPageChange,
        }}
      />
    </div>
  );
}
