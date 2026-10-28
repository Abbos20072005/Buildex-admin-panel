import { AppsIcon, DownloadIcon, FilterIcon, ListIcon } from "@/shared/icons";
import { Badge, Button, Dropdown, Segmented } from "antd";
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
  /** the uz / ru texts file is being prepared */
  textsLoading: boolean;
  onViewChange: (view: ProductView) => void;
  onToggleFilters: () => void;
  /** the table of products as CSV */
  onExport: () => void;
  /** the uz / ru texts as XLSX; `rawHtml` — descriptions as HTML instead of plain text */
  onExportTexts: (rawHtml: boolean) => void;
}

export function ProductsToolbar({
  total,
  view,
  filtersOpen,
  activeFilterCount,
  exportLabel,
  textsLoading,
  onViewChange,
  onToggleFilters,
  onExport,
  onExportTexts,
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
        <Dropdown
          trigger={["click"]}
          disabled={!total}
          menu={{
            items: [
              { key: "table", label: t("products.exportMenu.table") },
              {
                key: "texts",
                label: t("products.exportMenu.texts"),
                children: [
                  { key: "texts-plain", label: t("products.exportMenu.textsPlain") },
                  { key: "texts-html", label: t("products.exportMenu.textsHtml") },
                ],
              },
            ],
            onClick: ({ key }) => {
              if (key === "table") onExport();
              else onExportTexts(key === "texts-html");
            },
          }}
        >
          <Button icon={<DownloadIcon />} loading={!!exportLabel || textsLoading} disabled={!total}>
            {exportLabel ?? t("products.export")}
          </Button>
        </Dropdown>
      </div>
    </div>
  );
}
