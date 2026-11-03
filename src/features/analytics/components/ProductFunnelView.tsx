import { Alert, Button, DatePicker, Input, Segmented, Select, Table, Tooltip } from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import type { SorterResult } from "antd/es/table/interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { oneDecimal } from "@/features/dashboard";
import { getErrorMessage } from "@/shared/api";
import { DownloadIcon } from "@/shared/icons";
import { formatNumber } from "@/shared/lib/format";
import {
  type FunnelChannel,
  type FunnelFilters,
  type FunnelRow,
  type FunnelSortKey,
} from "../api/productFunnel.api";
import { useProductFunnelExport } from "../hooks/useProductFunnelExport";
import { useProductFunnelQuery } from "../hooks/queries";

/** Quick periods; "range" opens the date pickers. */
type PeriodKey = "7" | "30" | "90" | "range";

const DATE = "DD.MM.YYYY";
const PAGE_SIZES = ["20", "50", "100"];
/** A completion rate below this is highlighted (a PM suggestion, change it here). */
const LOW_RATE = 30;

/** What the API does without `ordering` (the most viewed first), shown as the sorted column. */
const DEFAULT_SORT = { key: "views", order: "descend" } as const;

const dash = <span className="text-slate-400">—</span>;

/** "57,1%", "0%"; a dash when nobody started a checkout. */
function RateCell({ value }: { value: number | null }) {
  if (value === null) return dash;
  return (
    <span
      className={
        value < LOW_RATE
          ? "rounded bg-amber-50 px-1.5 py-0.5 font-bold text-amber-700"
          : "font-semibold"
      }
    >
      {oneDecimal(value)}%
    </span>
  );
}

/**
 * Tovar voronkasi: per product, views → cart → checkout → purchases. A page of its own, or
 * `embedded` under the other blocks of the Savdo page (a smaller title, its own filters).
 */
export function ProductFunnelView({ embedded = false }: { embedded?: boolean }) {
  const { t, i18n } = useTranslation();
  const [periodKey, setPeriodKey] = useState<PeriodKey>("30");
  const [range, setRange] = useState<[string, string] | null>(null);
  const [channel, setChannel] = useState<FunnelChannel>("all");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<FunnelFilters["sort"]>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // the search goes to the API a moment after the typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // a custom range without both dates yet falls back to the last 30 days
  const period: FunnelFilters["period"] =
    periodKey === "range" && range
      ? { kind: "range", from: range[0], to: range[1] }
      : { kind: "days", days: periodKey === "range" ? 30 : Number(periodKey) };
  const filters: FunnelFilters = { period, channel, search, sort };

  const query = useProductFunnelQuery(filters, page, pageSize);
  const exporter = useProductFunnelExport();
  const data = query.data;

  const reset =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(1);
    };

  // the arrow shows the real order: the API default is the most viewed first
  const sortOrder = (key: FunnelSortKey) => {
    const active = sort ?? DEFAULT_SORT;
    return active.key === key ? active.order : null;
  };
  const sorted = (key: FunnelSortKey) => ({ sorter: true, sortOrder: sortOrder(key) });

  const columns: TableColumnsType<FunnelRow> = [
    {
      key: "n",
      title: "№",
      width: 56,
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      key: "product",
      title: t("funnel.columns.product"),
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
            {row.image && (
              <img src={row.image} alt="" className="size-full object-contain" loading="lazy" />
            )}
          </span>
          <div className="min-w-0">
            <Link to={`/products/${row.id}`} className="line-clamp-2 font-semibold">
              {row.name || `ID ${row.id}`}
            </Link>
            {row.articulCode && (
              <div className="font-mono text-[11px] text-slate-500">{row.articulCode}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "views",
      title: t("funnel.columns.views"),
      align: "right",
      ...sorted("views"),
      render: (_, row) => formatNumber(row.views),
    },
    {
      key: "add_to_cart",
      title: t("funnel.columns.addToCart"),
      align: "right",
      ...sorted("add_to_cart"),
      render: (_, row) => formatNumber(row.addToCart),
    },
    {
      key: "checkout_start",
      title: t("funnel.columns.checkoutStart"),
      align: "right",
      ...sorted("checkout_start"),
      render: (_, row) => formatNumber(row.checkoutStart),
    },
    {
      key: "purchases",
      title: t("funnel.columns.purchases"),
      align: "right",
      ...sorted("purchases"),
      render: (_, row) => (
        <>
          {formatNumber(row.purchases)}
          {row.otherPurchases > 0 && (
            <Tooltip title={t("funnel.otherPurchases", { count: row.otherPurchases })}>
              <span className="ml-1.5 cursor-help text-xs text-slate-400">
                +{formatNumber(row.otherPurchases)}
              </span>
            </Tooltip>
          )}
        </>
      ),
    },
    {
      key: "incomplete",
      title: t("funnel.columns.incomplete"),
      align: "right",
      ...sorted("incomplete"),
      render: (_, row) => formatNumber(row.incomplete),
    },
    {
      key: "completion_rate",
      title: t("funnel.columns.completionRate"),
      align: "right",
      ...sorted("completion_rate"),
      render: (_, row) => <RateCell value={row.completionRate} />,
    },
  ];

  const onTableChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter: SorterResult<FunnelRow> | SorterResult<FunnelRow>[],
  ) => {
    const single = Array.isArray(sorter) ? sorter[0] : sorter;
    const next =
      single?.order && single.columnKey
        ? { key: single.columnKey as FunnelSortKey, order: single.order }
        : null;
    // the table reports the sort it shows (the default included): only a different one is a click
    // on a header; clearing the sort goes back to the default (the most viewed first)
    const shown = sort ?? DEFAULT_SORT;
    const changed = next ? next.key !== shown.key || next.order !== shown.order : sort !== null;
    if (changed) {
      setSort(next);
      setPage(1);
      return;
    }
    setPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 20);
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          {embedded ? (
            <h2 className="m-0 text-lg font-bold tracking-tight">{t("nav.productFunnel")}</h2>
          ) : (
            <>
              <div className="text-xs text-slate-500">{t("nav.analytics")}</div>
              <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.productFunnel")}</h1>
            </>
          )}
          <div className="mt-1 text-xs text-slate-500">{t("funnel.subtitle")}</div>
        </div>
        <Button
          icon={<DownloadIcon />}
          loading={exporter.loading}
          onClick={() => void exporter.run(filters, i18n.language)}
        >
          {t("funnel.export")}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented<PeriodKey>
          value={periodKey}
          onChange={reset(setPeriodKey)}
          options={[
            { value: "7", label: t("analytics.periods.7") },
            { value: "30", label: t("analytics.periods.30") },
            { value: "90", label: t("funnel.periods.90") },
            { value: "range", label: t("analytics.periods.range") },
          ]}
        />
        {periodKey === "range" && (
          <DatePicker.RangePicker
            format={DATE}
            allowClear={false}
            disabledDate={(date, info) => {
              // at most 365 days between the two ends
              const start = info.from;
              return !!start && Math.abs(date.diff(start, "day")) > 364;
            }}
            onChange={(dates) =>
              dates?.[0] &&
              dates[1] &&
              reset(setRange)([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")])
            }
          />
        )}
        <Select<FunnelChannel>
          className="w-44"
          value={channel}
          onChange={reset(setChannel)}
          options={(["all", "site", "app"] as const).map((value) => ({
            value,
            label: t(`funnel.channels.${value}`),
          }))}
        />
        <Input.Search
          allowClear
          className="w-72"
          placeholder={t("funnel.searchPlaceholder")}
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      {query.error && !data ? (
        <Alert
          type="error"
          showIcon
          title={t("funnel.loadError")}
          description={getErrorMessage(query.error)}
          action={
            <Button size="small" onClick={() => void query.refetch()}>
              {t("common.retry")}
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Table<FunnelRow>
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={data?.items ?? []}
            loading={query.isLoading || query.isPlaceholderData}
            scroll={{ x: 900 }}
            showSorterTooltip={false}
            onChange={onTableChange}
            locale={{ emptyText: <div className="py-10 text-slate-500">{t("funnel.empty")}</div> }}
            pagination={{
              current: page,
              pageSize,
              total: data?.total ?? 0,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZES,
            }}
          />
        </div>
      )}
    </>
  );
}
