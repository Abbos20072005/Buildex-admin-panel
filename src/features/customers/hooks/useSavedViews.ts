import { useState } from "react";
import { CUSTOMER_API } from "../model/capabilities";
import type { CustomerTab } from "../lib/filters";
import type { CustomerFilters } from "../model/types";

/** A saved combination of the tab and the filters. */
export interface SavedView {
  id: string;
  name: string;
  tab: CustomerTab;
  filters: CustomerFilters;
  /** a ready-made view: cannot be removed */
  builtIn?: boolean;
  /** the view uses a filter the backend does not have yet */
  waitsForBackend?: boolean;
}

const STORAGE_KEY = "buildex-admin.customers.views";

/** The three views of the design; the names are translated where they are shown. */
export const BUILT_IN_VIEWS: SavedView[] = [
  {
    id: "big",
    name: "big",
    tab: "all",
    filters: { purchaseMin: 10_000_000 },
    builtIn: true,
    waitsForBackend: !CUSTOMER_API.rangeFilters,
  },
  { id: "pro-active", name: "pro-active", tab: "pro", filters: { isActive: true }, builtIn: true },
  {
    id: "returns",
    name: "returns",
    tab: "all",
    filters: { hasReturns: true },
    builtIn: true,
    waitsForBackend: !CUSTOMER_API.returns,
  },
];

function read(): SavedView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedView[]) : [];
  } catch {
    return [];
  }
}

/** The views of the list: the ready-made ones and the ones this browser saved. */
export function useSavedViews() {
  const [saved, setSaved] = useState<SavedView[]>(read);

  const persist = (next: SavedView[]) => {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage is full or blocked: the views live until the page is closed
    }
  };

  return {
    views: [...BUILT_IN_VIEWS, ...saved],
    save: (name: string, tab: CustomerTab, filters: CustomerFilters) =>
      persist([...saved, { id: `view-${Date.now()}`, name, tab, filters }]),
    remove: (id: string) => persist(saved.filter((view) => view.id !== id)),
  };
}
