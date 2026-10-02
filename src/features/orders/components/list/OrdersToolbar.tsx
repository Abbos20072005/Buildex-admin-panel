import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import { Badge, Button } from "antd";
import { useTranslation } from "react-i18next";
import { formatNumber } from "@/shared/lib/format";
import { brand } from "@/theme";

interface Props {
  total: number | undefined;
  filtersOpen: boolean;
  activeFilterCount: number;
  exportLabel: string | null;
  onToggleFilters: () => void;
  onExport: () => void;
}

export function OrdersToolbar({
  total,
  filtersOpen,
  activeFilterCount,
  exportLabel,
  onToggleFilters,
  onExport,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="m-0 text-2xl font-bold tracking-tight">
        {t("orders.title")}{" "}
        {total !== undefined && (
          <span className="font-medium text-slate-400">{formatNumber(total)}</span>
        )}
      </h1>

      <div className="flex gap-2">
        <Badge count={activeFilterCount} size="small" color={brand.primary}>
          <Button
            icon={<FilterOutlined />}
            type={filtersOpen ? "primary" : "default"}
            ghost={filtersOpen}
            onClick={onToggleFilters}
          >
            {t("orders.filters")}
          </Button>
        </Badge>
        <Button
          icon={<DownloadOutlined />}
          loading={!!exportLabel}
          disabled={!total}
          onClick={onExport}
        >
          {exportLabel ?? t("orders.export")}
        </Button>
      </div>
    </div>
  );
}
