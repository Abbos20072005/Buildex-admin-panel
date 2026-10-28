/** `branch_type` of the API: a showroom, a market (shop) or a 1C warehouse. */
export type StoreType = 0 | 1 | 2;

export const STORE_TYPES: StoreType[] = [1, 0, 2];

/** One day of the schedule: 0 = Monday … 6 = Sunday; the times are "HH:MM" (null on a closed day). */
export interface ScheduleDay {
  day: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export type Localized = { uz: string; ru: string };

/** A store (pickup point) — `/admin/branches/` of the API. */
export interface Store {
  id: number;
  /** name in the admin UI language */
  name: string;
  names: Localized;
  addresses: Localized;
  /** a landmark near the store ("mo'ljal") */
  landmarks: Localized;
  descriptions: Localized;
  type: StoreType;
  latitude: number | null;
  longitude: number | null;
  /** 7 days, Monday first */
  schedule: ScheduleDay[];
  /** open right now by the schedule (Tashkent time) */
  isOpenNow: boolean;
  /** "+998901234567" */
  phone: string;
  image: string | null;
  isActive: boolean;
  /** the order of the list on the site */
  position: number;
  /** the 1C warehouse code */
  code: string;
  /** pickup orders of this store: a store with orders can only be deactivated, not deleted */
  ordersCount: number;
}

export interface StoreFilters {
  search?: string;
  type?: StoreType;
  isActive?: boolean;
}

export interface StoreListParams {
  filters: StoreFilters;
  page: number;
  pageSize: number;
}

/** What the form edits and sends. */
export interface StoreInput {
  names: Localized;
  addresses: Localized;
  landmarks: Localized;
  descriptions: Localized;
  type: StoreType;
  latitude: number | null;
  longitude: number | null;
  schedule: ScheduleDay[];
  /** the 9 digits after +998 */
  phone: string;
  isActive: boolean;
  code: string;
}

export interface StoreFiles {
  image?: File;
}
