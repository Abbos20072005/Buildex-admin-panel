import type { BlockDraft, HiddenReason, PreviewBlock } from "../model/preview";
import type { Channel, HomeBlock } from "../model/types";

/** Why a block would not reach customers of this tab, or null when it would. */
function hiddenReason(
  channel: Channel,
  flags: { isVisible: boolean; showOnSite: boolean; showInApp: boolean },
  ruleHidden: boolean,
): HiddenReason | null {
  if (!flags.isVisible) return "manual";
  if (channel === "site" ? !flags.showOnSite : !flags.showInApp) return "channel";
  return ruleHidden ? "rule" : null;
}

/**
 * The page as it would be: the saved blocks with the unsaved edits of the open editor on top
 * (an edited block is replaced, a new one is appended). Blocks that won't reach customers stay
 * in the list and are marked, so it is clear why they don't show.
 */
export function buildPreviewBlocks(
  blocks: HomeBlock[],
  draft: BlockDraft | null,
  channel: Channel,
): PreviewBlock[] {
  const result = blocks.map((block): PreviewBlock => {
    const edited = draft !== null && draft.id === block.id;
    if (edited) {
      return {
        ...draft,
        key: String(block.id),
        hidden: hiddenReason(channel, draft, block.status === "rule_hidden"),
        active: true,
        isNew: false,
        itemsCount: block.itemsCount,
      };
    }
    return {
      key: String(block.id),
      type: block.type,
      title: block.title,
      bannerPlacement: block.bannerPlacement,
      bannerId: block.banner?.id ?? null,
      badgeId: block.badge?.id ?? null,
      saleId: block.sale?.id ?? null,
      days: block.days,
      pages: block.pages,
      hidden: hiddenReason(
        channel,
        { isVisible: block.isVisible, showOnSite: block.showOnSite, showInApp: block.showInApp },
        block.status === "rule_hidden",
      ),
      active: false,
      isNew: false,
      itemsCount: block.itemsCount,
    };
  });

  if (draft && draft.id === null) {
    result.push({
      ...draft,
      key: "new",
      hidden: hiddenReason(channel, draft, false),
      active: true,
      isNew: true,
      itemsCount: null,
    });
  }
  return result;
}
