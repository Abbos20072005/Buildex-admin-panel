import type { Dayjs } from "dayjs";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  PRODUCT_TABS,
  TAB_FILTERS,
  UNITS,
  type ProductTab,
  type ProductView,
} from "../model/constants";
import type { ProductFilters, ProductSort, Unit } from "../model/types";

/** URL param names — the whole list state lives in the address bar (shareable, survives reload). */
const PARAM = {
  tab: "tab",
  view: "view",
  search: "q",
  page: "page",
  size: "size",
  sort: "sort",
  category: "cat",
  brand: "br",
  badge: "badge",
  unit: "unit",
  inStock: "stock",
  hasDiscount: "disc",
  purchasable: "buy",
  erpActive: "erp",
  minPrice: "min",
  maxPrice: "max",
  from: "from",
  to: "to",
} as const;

type ParamKey = keyof typeof PARAM;

/** params that count as "active filters" (the badge on the Filters button) */
const FILTER_KEYS: ParamKey[] = [
  "category",
  "brand",
  "badge",
  "unit",
  "inStock",
  "hasDiscount",
  "purchasable",
  "erpActive",
  "minPrice",
  "maxPrice",
  "from",
];

const SORTS: ProductSort[] = [
  "-created_at",
  "created_at",
  "-price",
  "price",
  "-quantity",
  "quantity",
  "name",
  "-name",
];

const toNumber = (value: string | null) =>
  value && !Number.isNaN(Number(value)) ? Number(value) : undefined;

/** "1" → true, "0" → false, anything else → not set */
const toBool = (value: string | null) => (value === "1" ? true : value === "0" ? false : undefined);

export type ProductFilterPatch = Partial<
  Record<ParamKey, string | number | boolean | null | undefined>
>;

export function useProductListState() {
  const [params, setParams] = useSearchParams();

  const tabParam = params.get(PARAM.tab) as ProductTab | null;
  const tab: ProductTab = tabParam && PRODUCT_TABS.includes(tabParam) ? tabParam : "all";
  const view: ProductView = params.get(PARAM.view) === "cards" ? "cards" : "table";
  const page = Math.max(1, toNumber(params.get(PARAM.page)) ?? 1);
  const sizeParam = toNumber(params.get(PARAM.size));
  const pageSize = sizeParam && PAGE_SIZES.includes(sizeParam) ? sizeParam : DEFAULT_PAGE_SIZE;
  const sortParam = params.get(PARAM.sort) as ProductSort | null;
  const sort: ProductSort = sortParam && SORTS.includes(sortParam) ? sortParam : "-created_at";

  const search = params.get(PARAM.search) ?? "";
  const category = toNumber(params.get(PARAM.category));
  const brand = toNumber(params.get(PARAM.brand));
  const badge = toNumber(params.get(PARAM.badge));
  const unitParam = params.get(PARAM.unit) as Unit | null;
  const unit = unitParam && UNITS.includes(unitParam) ? unitParam : undefined;
  const inStock = toBool(params.get(PARAM.inStock));
  const hasDiscount = toBool(params.get(PARAM.hasDiscount));
  const purchasable = toBool(params.get(PARAM.purchasable));
  const erpActive = toBool(params.get(PARAM.erpActive));
  const minPrice = toNumber(params.get(PARAM.minPrice));
  const maxPrice = toNumber(params.get(PARAM.maxPrice));
  const from = params.get(PARAM.from) ?? undefined;
  const to = params.get(PARAM.to) ?? undefined;

  /** filters shared by the list and the tab counters (no tab here) */
  const filters = useMemo<ProductFilters>(
    () => ({
      search: search || undefined,
      category,
      brand,
      badge,
      unit,
      inStock,
      hasDiscount,
      purchasable,
      erpActive,
      minPrice,
      maxPrice,
      from,
      to,
    }),
    [
      search,
      category,
      brand,
      badge,
      unit,
      inStock,
      hasDiscount,
      purchasable,
      erpActive,
      minPrice,
      maxPrice,
      from,
      to,
    ],
  );

  /** list filters = shared filters + whatever the active tab adds */
  const listFilters = useMemo<ProductFilters>(
    () => ({ ...filters, ...TAB_FILTERS[tab] }),
    [filters, tab],
  );

  const activeFilterCount = FILTER_KEYS.filter((key) => params.has(PARAM[key])).length;

  /** Updates URL params; any change except paging / view sends the user back to page 1. */
  const update = useCallback(
    (patch: ProductFilterPatch, { keepPage = false } = {}) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            const name = PARAM[key as ParamKey];
            if (value === undefined || value === null || value === "" || value === "all")
              next.delete(name);
            else if (typeof value === "boolean") next.set(name, value ? "1" : "0");
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
      setTab: (value: ProductTab) => update({ tab: value }),
      setView: (value: ProductView) =>
        update({ view: value === "table" ? null : value }, { keepPage: true }),
      setPage: (value: number, size: number) =>
        update(
          { page: value === 1 ? null : value, size: size === DEFAULT_PAGE_SIZE ? null : size },
          { keepPage: true },
        ),
      setSort: (value: ProductSort) => update({ sort: value === "-created_at" ? null : value }),
      setDateRange: (range: [Dayjs, Dayjs] | null) =>
        update({ from: range?.[0].format("YYYY-MM-DD"), to: range?.[1].format("YYYY-MM-DD") }),
      setFilter: update,
      resetFilters: () =>
        update(Object.fromEntries([...FILTER_KEYS, "to"].map((key) => [key, null]))),
    }),
    [update],
  );

  return {
    tab,
    view,
    page,
    pageSize,
    sort,
    search,
    filters,
    listFilters,
    activeFilterCount,
    ...actions,
  };
}

export type ProductListState = ReturnType<typeof useProductListState>;
