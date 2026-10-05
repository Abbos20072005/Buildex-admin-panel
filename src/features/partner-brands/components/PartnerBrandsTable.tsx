import { TrashIcon, EditIcon, MoreIcon } from "@/shared/icons";
import { Button, Dropdown, Table, Tag, type TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import type { PartnerBrand } from "../model/types";

const PAGE_SIZES = ["20", "50", "100"];

interface Props {
  items: PartnerBrand[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  selectedId: number | null;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (id: number) => void;
  onDelete: (item: PartnerBrand) => void;
}

export function PartnerBrandsTable({
  items,
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

  const columns: TableColumnsType<PartnerBrand> = [
    {
      key: "name",
      title: t("partnerBrands.columns.name"),
      render: (_, item) => <span className="font-bold">{item.name}</span>,
    },
    {
      key: "status",
      title: t("partnerBrands.columns.status"),
      width: 140,
      render: (_, item) => (
        <Tag
          color={item.isActive ? "green" : "default"}
          variant="filled"
          className="m-0 font-semibold"
        >
          {t(item.isActive ? "partnerBrands.active" : "partnerBrands.inactive")}
        </Tag>
      ),
    },
    {
      key: "actions",
      width: 56,
      align: "right",
      render: (_, item) => (
        // the menu must not open the side panel
        <span onClick={(event) => event.stopPropagation()}>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                { key: "edit", icon: <EditIcon />, label: t("partnerBrands.edit") },
                {
                  key: "delete",
                  icon: <TrashIcon />,
                  label: t("common.delete"),
                  danger: true,
                },
              ],
              onClick: ({ key }) => (key === "edit" ? onOpen(item.id) : onDelete(item)),
            }}
          >
            <Button type="text" icon={<MoreIcon />} aria-label={t("partnerBrands.actions")} />
          </Dropdown>
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<PartnerBrand>
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={items}
        loading={loading}
        scroll={{ x: 480 }}
        onRow={(item) => ({
          className: clsx("cursor-pointer", item.id === selectedId && "bg-brand/5"),
          onClick: () => onOpen(item.id),
        })}
        locale={{ emptyText: <div className="py-10 text-slate-500">{t("common.noData")}</div> }}
        pagination={{
          current: page,
          pageSize,
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
