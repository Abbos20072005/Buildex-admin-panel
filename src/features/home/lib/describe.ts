import type { TFunction } from "i18next";
import { PRODUCT_BLOCKS } from "../model/constants";
import type { HomeBlock } from "../model/types";

/**
 * The grey line under a block title: what it shows and how much of it is there —
 * "Teg: Xit · 90 ta mos (118 dan)", "Bannerlar · Sayt · bosh slayder, 5 faol".
 */
export function describeBlock(block: HomeBlock, t: TFunction): string {
  const count = block.itemsCount;
  const matched =
    block.itemsTotal !== null
      ? t("home.desc.matched", { count, total: block.itemsTotal })
      : t("home.desc.count", { count });

  switch (block.type) {
    case "slider":
      return t("home.desc.slider", {
        placement: block.bannerPlacement
          ? t(`home.sliderPlacements.${block.bannerPlacement}`, block.bannerPlacement)
          : "—",
        count,
      });
    case "banner":
      return t("home.desc.banner", { name: block.banner?.name ?? "—", active: count > 0 });
    case "badge_products":
      return `${t("home.desc.badge", { name: block.badge?.name ?? "—" })} · ${matched}`;
    case "sale_products":
      return `${t("home.desc.sale", { name: block.sale?.name ?? t("home.mainSale") })} · ${matched}`;
    case "new_products":
      return `${t("home.desc.newProducts", { days: block.days ?? "—" })} · ${matched}`;
    case "pages":
      return t("home.desc.pages", {
        titles: block.pages.map((page) => page.titleRu || page.titleUz).join(", ") || "—",
      });
    default:
      // categories / brands / content / adds_brands / bestsellers / all_products
      return `${t(`home.desc.${block.type}`)} · ${PRODUCT_BLOCKS.includes(block.type) ? matched : t("home.desc.count", { count })}`;
  }
}
