import type { Dayjs } from "dayjs";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DEFAULT_PAGE_SIZE, ORDER_TABS, PAGE_SIZES, type OrderTab } from "../model/constants";
import type { Fulfillment, OrderFilters, OrderSort, PayStatus, PayType } from "../model/types";

/** URL param names — the whole list state lives in the address bar (shareable, survives reload). */
const PARAM = {
  tab: "tab",
  search: "q",
  page: "page",
  size: "size",
  sort: "sort",
  from: "from",
  to: "to",
  payType: "pt",
  payStatus: "ps",
  fulfillment: "ff",
  branch: "br",
  minTotal: "min",
  maxTotal: "max",
} as const;

/** params that count as "active filters" (the badge on the Filters button) */
const FILTER_PARAMS = [
  PARAM.from,
  PARAM.payType,
  PARAM.payStatus,
  PARAM.fulfillment,
  PARAM.branch,
  PARAM.minTotal,
  PARAM.maxTotal,
] as const;

const SORTS: OrderSort[] = ["-created_at", "created_at", "-total_price", "total_price"];

const toNumber = (value: string | null) =>
  value && !Number.isNaN(Number(value)) ? Number(value) : undefined;

export type FilterPatch = Partial<Record<keyof typeof PARAM, string | number | null | undefined>>;

export function useOrderListState() {
  const [params, setParams] = useSearchParams();

  const tabParam = params.get(PARAM.tab) as OrderTab | null;
  const tab: OrderTab = tabParam && ORDER_TABS.includes(tabParam) ? tabParam : "all";
  const page = Math.max(1, toNumber(params.get(PARAM.page)) ?? 1);
  const sizeParam = toNumber(params.get(PARAM.size));
  const pageSize = sizeParam && PAGE_SIZES.includes(sizeParam) ? sizeParam : DEFAULT_PAGE_SIZE;
  const sortParam = params.get(PARAM.sort) as OrderSort | null;
  const sort: OrderSort = sortParam && SORTS.includes(sortParam) ? sortParam : "-created_at";

  const search = params.get(PARAM.search) ?? "";
  const from = params.get(PARAM.from) ?? undefined;
  const to = params.get(PARAM.to) ?? undefined;
  const payType = (params.get(PARAM.payType) as PayType | null) ?? undefined;
  const payStatus = (params.get(PARAM.payStatus) as PayStatus | null) ?? undefined;
  const fulfillment = (params.get(PARAM.fulfillment) as Fulfillment | null) ?? undefined;
  const branch = toNumber(params.get(PARAM.branch));
  const minTotal = toNumber(params.get(PARAM.minTotal));
  const maxTotal = toNumber(params.get(PARAM.maxTotal));

  /** filters shared by the list and the tab counters (no status here) */
  const filters = useMemo<OrderFilters>(
    () => ({
      search: search || undefined,
      from,
      to,
      payType,
      payStatus,
      fulfillment,
      branch,
      minTotal,
      maxTotal,
    }),
    [search, from, to, payType, payStatus, fulfillment, branch, minTotal, maxTotal],
  );

  /** list filters = shared filters + the status of the active tab */
  const listFilters = useMemo<OrderFilters>(
    () => (tab === "all" ? filters : { ...filters, status: [tab] }),
    [filters, tab],
  );

  const activeFilterCount = FILTER_PARAMS.filter((key) => params.has(key)).length;

  /** Updates URL params; any change except paging sends the user back to page 1. */
  const update = useCallback(
    (patch: FilterPatch, { keepPage = false } = {}) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            const name = PARAM[key as keyof typeof PARAM];
            if (value === undefined || value === null || value === "" || value === "all")
              next.delete(name);
            else next.set(name, String(value));
          }
          if (!keepPage) next.delete(PARAM.page);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const actions = useMemo(
    () => ({
      setTab: (value: OrderTab) => update({ tab: value }),
      setPage: (value: number, size: number) =>
        update(
          { page: value === 1 ? null : value, size: size === DEFAULT_PAGE_SIZE ? null : size },
          { keepPage: true },
        ),
      setSort: (value: OrderSort) => update({ sort: value === "-created_at" ? null : value }),
      setDateRange: (range: [Dayjs, Dayjs] | null) =>
        update({ from: range?.[0].format("YYYY-MM-DD"), to: range?.[1].format("YYYY-MM-DD") }),
      setFilter: update,
      resetFilters: () =>
        update({
          from: null,
          to: null,
          payType: null,
          payStatus: null,
          fulfillment: null,
          branch: null,
          minTotal: null,
          maxTotal: null,
        }),
    }),
    [update],
  );

  return { tab, page, pageSize, sort, search, filters, listFilters, activeFilterCount, ...actions };
}

export type OrderListState = ReturnType<typeof useOrderListState>;
