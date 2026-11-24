/** Where the banner is shown. */
export type BannerPlacement = "home_top" | "home_bottom" | "catalog";

/** What a click on the banner opens. */
export type LinkType = "category" | "product" | "badge" | "brand" | "page" | "url";

/** Calculated by the backend on every request, never stored. */
export type BannerStatus = "active" | "scheduled" | "expired" | "archived";

/** `target.model` of the API: the object a banner leads to. */
export type TargetModel =
  | "productcategory"
  | "productsubcategory"
  | "productitemcategory"
  | "product"
  | "productbadge"
  | "brand";

export interface BannerTarget {
  model: TargetModel;
  id: number;
  name: string;
}

/** The language of a banner's pictures (they carry text, so every language has its own). */
export type BannerLang = "uz" | "ru";

/** The wide (16:5) and the square (1:1) picture of one language. */
export interface BannerPictures {
  desktop: string | null;
  mobile: string | null;
}

/** The four places a picture goes to: the kind of the picture and the language. */
export type ImageSlot = "desktopUz" | "desktopRu" | "mobileUz" | "mobileRu";

export const IMAGE_SLOT: Record<"desktop" | "mobile", Record<BannerLang, ImageSlot>> = {
  desktop: { uz: "desktopUz", ru: "desktopRu" },
  mobile: { uz: "mobileUz", ru: "mobileRu" },
};

export interface Banner {
  id: number;
  /** BNR-0412 */
  code: string;
  /** internal name (not shown to customers) */
  name: string;
  nameUz: string;
  nameRu: string;
  /** the Russian pictures: the list shows them, the Uzbek customer gets them when there is no Uzbek one */
  desktopImage: string | null;
  mobileImage: string | null;
  pictures: Record<BannerLang, BannerPictures>;
  placement: BannerPlacement;
  showOnSite: boolean;
  showOnIos: boolean;
  showOnAndroid: boolean;
  linkType: LinkType;
  target: BannerTarget | null;
  /** internal path for link_type=page, starts with "/" */
  page: string;
  /** full URL for link_type=url */
  link: string;
  /** YYYY-MM-DDTHH:MM:SS, Tashkent time */
  startsAt: string;
  endsAt: string | null;
  position: number;
  isVisible: boolean;
  status: BannerStatus;
}

/** What the editor sends. */
export interface BannerInput {
  name: string;
  placement: BannerPlacement;
  showOnSite: boolean;
  showOnIos: boolean;
  showOnAndroid: boolean;
  linkType: LinkType;
  target: { model: TargetModel; id: number } | null;
  page: string;
  link: string;
  startsAt: string;
  endsAt: string | null;
  isVisible: boolean;
}

/** Newly picked files by slot, and the saved pictures to remove (not the Russian desktop one). */
export type BannerFiles = Partial<Record<ImageSlot, File>> & {
  clear?: Partial<Record<ImageSlot, boolean>>;
};

/** GET /admin/banners/stats/ — cards and tab counters (not affected by list filters). */
export interface BannerStats {
  active: number;
  scheduled: number;
  expired: number;
  archived: number;
  /** non-archived banners with an external URL — "Tekshirish kerak" */
  external: number;
  homeTop: number;
  homeBottom: number;
  catalog: number;
}

/** The tabs of the list: the four placements and the archive. */
export type BannerTab = BannerPlacement | "archive";

/** An object a banner can lead to, found by the search of the "Manzil" field. */
export interface TargetOption {
  /** "product:97" */
  key: string;
  model: TargetModel;
  id: number;
  name: string;
  /** i18n key of the group in the select ("Kategoriya", "Pastki kategoriya"…) */
  group: string;
}
