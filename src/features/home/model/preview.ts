import type { BlockType, PageLink } from "./types";

/** Where the preview is drawn: the site tab is a desktop browser, the app tab is a phone. */
export type Device = "desktop" | "phone";

/** What a block draws its content from (the same fields the editor edits). */
export interface PreviewSource {
  type: BlockType;
  bannerPlacement: string;
  bannerId: number | null;
  badgeId: number | null;
  /** null with a sale block — the main sale */
  saleId: number | null;
  days: number | null;
  pages: PageLink[];
}

/** An unsaved edit of the open block editor, shown in the preview at once. */
export interface BlockDraft extends PreviewSource {
  /** null — a block that is being created */
  id: number | null;
  title: string;
  showOnSite: boolean;
  showInApp: boolean;
  isVisible: boolean;
}

/** One card / row / picture drawn in a block. */
export interface PreviewItem {
  id: number | string;
  title: string;
  image: string | null;
  price?: number | null;
  oldPrice?: number | null;
}

/** Why a block is shown dimmed: it will not reach customers. */
export type HiddenReason = "manual" | "rule" | "channel";

/** A block of the preview: the saved block with the open editor's edits on top. */
export interface PreviewBlock extends PreviewSource {
  key: string;
  title: string;
  hidden: HiddenReason | null;
  /** the block that is open in the editor */
  active: boolean;
  /** a block that doesn't exist yet */
  isNew: boolean;
  /** saved count text, e.g. "90 / 118" — only for a saved block */
  itemsCount: number | null;
}
