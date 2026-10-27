import dayjs from "dayjs";
import type { CustomerFilters } from "../model/types";

/** The tabs above the list; each one is a ready filter. */
export type CustomerTab = "all" | "pro" | "new" | "blocked" | "deleted";

export const CUSTOMER_TABS: CustomerTab[] = ["all", "pro", "new", "blocked", "deleted"];

/** "Holat" of the filter panel: one choice, sent as the filters the API has. */
export type CustomerState = "active" | "verified" | "unverified" | "blocked";

export const CUSTOMER_STATES: CustomerState[] = ["active", "verified", "unverified", "blocked"];

export const DATE_FORMAT = "YYYY-MM-DD";

/** A customer is "new" for this many days after the registration. */
export const NEW_DAYS = 7;

export const newSince = () => dayjs().subtract(NEW_DAYS, "day").format(DATE_FORMAT);

export const tabToFilters = (tab: CustomerTab): CustomerFilters =>
  ({
    all: {},
    pro: { role: "prorab" as const },
    new: { from: newSince() },
    blocked: { isBlocked: true },
    deleted: { isDeleted: true },
  })[tab];

/** All tabs are shown; "O'chirilgan" stays empty until the backend has deleted customers. */
export const visibleTabs = (): CustomerTab[] => CUSTOMER_TABS;

export const stateToFilters = (state: CustomerState | undefined): CustomerFilters =>
  state
    ? {
        active: { isActive: true },
        verified: { verified: true },
        unverified: { verified: false },
        blocked: { isBlocked: true },
      }[state]
    : {};

export const stateOfFilters = (filters: CustomerFilters): CustomerState | undefined =>
  filters.isBlocked
    ? "blocked"
    : filters.isActive
      ? "active"
      : filters.verified === true
        ? "verified"
        : filters.verified === false
          ? "unverified"
          : undefined;

/** The filters of the panel that stay out of `stateOfFilters`. */
const STATE_KEYS = ["isActive", "verified", "isBlocked"] as const;

export const withState = (
  filters: CustomerFilters,
  state: CustomerState | undefined,
): CustomerFilters => {
  const next = { ...filters };
  for (const key of STATE_KEYS) delete next[key];
  return { ...next, ...stateToFilters(state) };
};

/** What the server gets: the panel's filters, then the tab (the tab wins on a clash). */
export const mergeFilters = (tab: CustomerTab, filters: CustomerFilters): CustomerFilters => ({
  ...filters,
  ...tabToFilters(tab),
});

/** Number of filters the panel holds (the search box and the tab are counted apart). */
export const countFilters = (filters: CustomerFilters): number => {
  const { search: _search, ...rest } = filters;
  const pairs: [boolean, boolean][] = [
    [rest.segment !== undefined, true],
    [stateOfFilters(rest) !== undefined, true],
    [rest.channel !== undefined, true],
    [rest.from !== undefined || rest.to !== undefined, true],
    [rest.ordersMin !== undefined || rest.ordersMax !== undefined, true],
    [rest.purchaseMin !== undefined || rest.purchaseMax !== undefined, true],
    [rest.lastOrderFrom !== undefined || rest.lastOrderTo !== undefined, true],
    [rest.hasReturns !== undefined, true],
    [rest.hasOrders !== undefined, true],
    [rest.role !== undefined, true],
  ];
  return pairs.filter(([on]) => on).length;
};

/** Removes the keys of one filter chip. */
export type ChipKey =
  | "segment"
  | "state"
  | "channel"
  | "registered"
  | "orders"
  | "purchase"
  | "lastOrder"
  | "returns"
  | "hasOrders"
  | "role"
  | "search";

export const clearChip = (filters: CustomerFilters, key: ChipKey): CustomerFilters => {
  const next = { ...filters };
  const drop = (...keys: (keyof CustomerFilters)[]) => keys.forEach((k) => delete next[k]);
  if (key === "segment") drop("segment");
  if (key === "state") return withState(next, undefined);
  if (key === "channel") drop("channel");
  if (key === "registered") drop("from", "to");
  if (key === "orders") drop("ordersMin", "ordersMax");
  if (key === "purchase") drop("purchaseMin", "purchaseMax");
  if (key === "lastOrder") drop("lastOrderFrom", "lastOrderTo");
  if (key === "returns") drop("hasReturns");
  if (key === "hasOrders") drop("hasOrders");
  if (key === "role") drop("role");
  if (key === "search") drop("search");
  return next;
};
