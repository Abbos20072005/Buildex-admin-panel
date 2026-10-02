import { Switch, Table, type TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from "../model/constants";
import type { Brand } from "../model/types";

interface Props {
  brands: Brand[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  selectedId: number | null;
  /** brand whose "home page" switch is being saved */
  togglingId: number | null;
  onPageChange: (page: number, pageSize: number) => void;
  onOpen: (id: number) => void;
  onToggleVisible: (brand: Brand, visible: boolean) => void;
}

/** "SE" for "Schneider Electric", "C" for "Chint" — shown when a brand has no logo */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

function BrandLogo({ brand }: { brand: Brand }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
      {brand.image ? (
        <img src={brand.image} alt="" loading="lazy" className="size-full object-contain p-1" />
      ) : (
        initials(brand.name)
      )}
    </span>
  );
}

/** UZ / RU chip of the description: red and struck through when that language is empty. */
function LangChip({ filled, label }: { filled: boolean; label: string }) {
  return (
    <span
      className={clsx(
        "rounded px-1.5 py-0.5 text-[11px] leading-4 font-bold",
        filled ? "bg-slate-100 text-slate-600" : "bg-red-50 text-red-600 line-through",
      )}
    >
      {label}
    </span>
  );
}

export function BrandsTable({
  brands,
  total,
  loading,
  page,
  pageSize,
  selectedId,
  togglingId,
  onPageChange,
  onOpen,
  onToggleVisible,
}: Props) {
  const { t } = useTranslation();

  const columns: TableColumnsType<Brand> = [
    {
      key: "logo",
      width: 64,
      render: (_, brand) => <BrandLogo brand={brand} />,
    },
    {
      key: "name",
      title: t("brands.columns.name"),
      width: 220,
      render: (_, brand) => <span className="font-bold">{brand.name}</span>,
    },
    {
      key: "description",
      title: t("brands.columns.description"),
      width: 130,
      render: (_, brand) => (
        <span className="flex gap-1">
          <LangChip filled={!!brand.descriptions.uz} label="UZ" />
          <LangChip filled={!!brand.descriptions.ru} label="RU" />
        </span>
      ),
    },
    {
      key: "country",
      title: t("brands.columns.country"),
      width: 160,
      render: (_, brand) => brand.country || <span className="text-slate-300">—</span>,
    },
    {
      key: "products",
      title: t("brands.columns.products"),
      width: 110,
      align: "right",
      render: (_, brand) => (
        <span className="tabular-nums">{formatNumber(brand.productsCount)}</span>
      ),
    },
    {
      key: "visible",
      title: t("brands.columns.visible"),
      width: 130,
      render: (_, brand) => (
        // the switch must not open the side panel
        <span onClick={(event) => event.stopPropagation()}>
          <Switch
            checked={brand.isVisible}
            loading={togglingId === brand.id}
            onChange={(visible) => onToggleVisible(brand, visible)}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<Brand>
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={brands}
        loading={loading}
        scroll={{ x: 820 }}
        onRow={(brand) => ({
          className: clsx("cursor-pointer", brand.id === selectedId && "bg-brand/5"),
          onClick: () => onOpen(brand.id),
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
