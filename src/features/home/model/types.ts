/** What a block shows; the type is chosen when the block is created and never changes. */
export type BlockType =
  | "slider"
  | "banner"
  | "categories"
  | "brands"
  | "badge_products"
  | "sale_products"
  | "new_products"
  | "bestsellers"
  | "all_products"
  | "pages"
  | "content"
  | "adds_brands";

/** Calculated by the backend: shown, hidden by hand, or hidden by the display rules. */
export type BlockStatus = "visible" | "hidden" | "rule_hidden";

/** The two tabs of the page. */
export type Channel = "site" | "app";

/** A link of a "pages" block ("Xizmatlar va shartlar"). */
export interface PageLink {
  titleRu: string;
  titleUz: string;
  titleEn: string;
  /** an internal path starting with "/" */
  path: string;
}

/** The source of a block that points at one record (banner / tag / sale). */
export interface SourceRef {
  id: number;
  name: string;
}

/** A block of the home page draft. */
export interface HomeBlock {
  id: number;
  type: BlockType;
  /** title in the admin UI language */
  title: string;
  titleRu: string;
  titleUz: string;
  titleEn: string;
  position: number;
  isVisible: boolean;
  showOnSite: boolean;
  showInApp: boolean;
  /** `slider` only */
  bannerPlacement: string;
  banner: SourceRef | null;
  badge: SourceRef | null;
  /** `null` with a sale block — the main sale */
  sale: SourceRef | null;
  days: number | null;
  pages: PageLink[];
  itemsCount: number;
  /** only product blocks: active products of the source before the rules */
  itemsTotal: number | null;
  status: BlockStatus;
}

/** What the block editor sends (POST creates with `type`, PATCH ignores it). */
export interface HomeBlockInput {
  type: BlockType;
  titleRu: string;
  titleUz: string;
  titleEn: string;
  showOnSite: boolean;
  showInApp: boolean;
  isVisible: boolean;
  bannerPlacement: string;
  bannerId: number | null;
  badgeId: number | null;
  saleId: number | null;
  days: number | null;
  pages: PageLink[];
}

/** "Ko'rsatish qoidalari" and the publish state of the page. */
export interface HomePageState {
  hideOutOfStock: boolean;
  hideStalePrice: boolean;
  minProducts: number;
  personalFeedEnabled: boolean;
  personalFeedHoldoutPercent: number;
  /** ISO time; null — never published */
  publishedAt: string | null;
  publishedBy: { id: number; fullName: string } | null;
  /** the draft differs from the published version — "Nashr qilish" is active */
  hasChanges: boolean;
}

export type HomeRulesInput = Partial<
  Pick<HomePageState, "hideOutOfStock" | "hideStalePrice" | "minProducts">
>;

/** A record offered in a source select (banner / tag / sale). */
export interface SourceOption {
  id: number;
  name: string;
}
