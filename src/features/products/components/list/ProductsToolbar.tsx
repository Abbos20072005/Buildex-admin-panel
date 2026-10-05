import { AppsIcon, DownloadIcon, FilterIcon, ListIcon } from "@/shared/icons";
import { Badge, Button, Segmented } from "antd";
import { useTranslation } from "react-i18next";
import { brand } from "@/theme";
import { formatNumber } from "@/shared/lib/format";
import type { ProductView } from "../../model/constants";

interface Props {
  total: number | undefined;
  view: ProductView;
  filtersOpen: boolean;
  activeFilterCount: number;
  exportLabel: string | null;
  onViewChange: (view: ProductView) => void;
  onToggleFilters: () => void;
  onExport: () => void;
}

export function ProductsToolbar({
  total,
  view,
  filtersOpen,
  activeFilterCount,
  exportLabel,
  onViewChange,
  onToggleFilters,
  onExport,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="m-0 text-2xl font-bold tracking-tight">
          {t("products.title")}{" "}
          {total !== undefined && (
            <span className="font-medium text-slate-400">{formatNumber(total)}</span>
          )}
        </h1>
        <p className="m-0 mt-1 text-[13px] text-slate-500">{t("products.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Segmented<ProductView>
          value={view}
          onChange={onViewChange}
          options={[
            { value: "table", label: t("products.view.table"), icon: <ListIcon /> },
            { value: "cards", label: t("products.view.cards"), icon: <AppsIcon /> },
          ]}
        />
        <Badge count={activeFilterCount} size="small" color={brand.primary}>
          <Button
            icon={<FilterIcon />}
            type={filtersOpen ? "primary" : "default"}
            ghost={filtersOpen}
            onClick={onToggleFilters}
          >
            {t("products.filters")}
          </Button>
        </Badge>
        <Button
          icon={<DownloadIcon />}
          loading={!!exportLabel}
          disabled={!total}
          onClick={onExport}
        >
          {exportLabel ?? t("products.export")}
        </Button>
      </div>
    </div>
  );
}
