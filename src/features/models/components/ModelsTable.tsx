import { TrashIcon, EditIcon, MoreIcon } from "@/shared/icons";
import { Button, Dropdown, Table, Tag, type TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "../model/constants";
import type { ProductModel } from "../model/types";

interface Props {
  models: ProductModel[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  selectedId: number | null;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (id: number) => void;
  onDelete: (model: ProductModel) => void;
}

export function ModelsTable({
  models,
  total,
  loading,
  page,
  pageSize,
  selectedId,
  onPageChange,
  onOpen,
  onDelete,
}: Props) {
  const { t } = useTranslation();

  const columns: TableColumnsType<ProductModel> = [
    {
      key: "name",
      title: t("models.columns.name"),
      render: (_, model) => <span className="font-bold">{model.name}</span>,
    },
    {
      key: "brand",
      title: t("models.columns.brand"),
      render: (_, model) => model.brand?.name ?? <span className="text-slate-300">—</span>,
    },
    {
      key: "products",
      title: t("models.columns.products"),
      width: 130,
      align: "right",
      render: (_, model) => (
        <span className="tabular-nums">{formatNumber(model.productsCount)}</span>
      ),
    },
    {
      key: "status",
      title: t("models.columns.status"),
      width: 120,
      render: (_, model) => (
        <Tag
          color={model.isActive ? "green" : "gold"}
          variant="filled"
          className="m-0 font-semibold"
        >
          {t(model.isActive ? "models.active" : "models.draft")}
        </Tag>
      ),
    },
    {
      key: "actions",
      width: 56,
      align: "right",
      render: (_, model) => (
        // the menu must not open the side panel
        <span onClick={(event) => event.stopPropagation()}>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                { key: "edit", icon: <EditIcon />, label: t("models.edit") },
                {
                  key: "delete",
                  icon: <TrashIcon />,
                  label: t("common.delete"),
                  danger: true,
                  // a model with products can't be deleted — deactivate it instead
                  disabled: model.productsCount > 0,
                },
              ],
              onClick: ({ key }) => (key === "edit" ? onOpen(model.id) : onDelete(model)),
            }}
          >
            <Button type="text" icon={<MoreIcon />} aria-label={t("models.actions")} />
          </Dropdown>
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<ProductModel>
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={models}
        loading={loading}
        scroll={{ x: 640 }}
        onRow={(model) => ({
          className: clsx("cursor-pointer", model.id === selectedId && "bg-brand/5"),
          onClick: () => onOpen(model.id),
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
