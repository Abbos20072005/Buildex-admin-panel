import type { ModalProps, ThemeConfig } from "antd";
import { brand } from "./colors";
import { fonts } from "./fonts";

export const theme: ThemeConfig = {
  cssVar: { key: "bx" },
  hashed: false,
  token: {
    colorPrimary: brand.primary,
    colorInfo: brand.primary,
    colorLink: brand.primary,
    colorLinkHover: brand.primaryHover,
    colorWarning: brand.yellow,
    colorError: brand.danger,
    colorText: brand.text,
    colorTextPlaceholder: brand.mutedText,
    colorBorder: brand.border,
    colorBgLayout: brand.surface,
    fontFamily: fonts.sans,
    fontFamilyCode: fonts.mono,
    borderRadius: 10,
    controlHeight: 38,
  },
  components: {
    Layout: {
      siderBg: brand.white,
      headerBg: brand.white,
      headerHeight: 60,
      headerPadding: "0 20px",
    },
    Menu: {
      itemBg: brand.white,
      subMenuItemBg: brand.white,
      itemColor: brand.textSecondary,
      itemHoverBg: brand.sidebarHover,
      itemHoverColor: brand.text,
      itemSelectedBg: brand.sidebarSelected,
      itemSelectedColor: brand.text,
      itemBorderRadius: 8,
      itemMarginInline: 10,
      iconSize: 18,
      itemHeight: 36,
      itemMarginBlock: 2,
    },
    Table: {
      headerBg: brand.surfaceAlt,
      headerColor: brand.textSecondary,
      rowSelectedBg: brand.primarySoft,
      rowSelectedHoverBg: brand.primarySoftHover,
    },
    Tabs: {
      itemColor: brand.textSecondary,
    },
    Card: {
      headerFontSize: 15,
    },
  },
};

/** Shared look of the big detail modals (order, product): grey body, white header. */
export const modalStyles: ModalProps["styles"] = {
  container: { background: brand.panel, padding: 0 },
  header: {
    background: brand.white,
    padding: "18px 24px 16px",
    margin: 0,
    borderBottom: `1px solid ${brand.divider}`,
  },
  body: { padding: 20 },
};
