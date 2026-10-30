import { theme as antdTheme, type ModalProps, type ThemeConfig } from "antd";
import { brand, darkBrand } from "./colors";
import { fonts } from "./fonts";

export type ThemeName = "light" | "dark";

/** The colours that differ between the light and the dark look. */
const palettes = {
  light: {
    primary: brand.primary,
    primaryHover: brand.primaryHover,
    primarySoft: brand.primarySoft,
    primarySoftHover: brand.primarySoftHover,
    text: brand.text,
    textSecondary: brand.textSecondary,
    mutedText: brand.mutedText,
    border: brand.border,
    divider: brand.divider,
    surface: brand.surface,
    surfaceAlt: brand.surfaceAlt,
    panel: brand.panel,
    container: brand.white,
    elevated: brand.white,
    sidebarHover: brand.sidebarHover,
    sidebarSelected: brand.sidebarSelected,
    danger: brand.danger,
    success: brand.success,
  },
  dark: darkBrand,
} as const;

export function buildTheme(name: ThemeName): ThemeConfig {
  const c = palettes[name];
  return {
    cssVar: { key: "bx" },
    hashed: false,
    algorithm: name === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: c.primary,
      colorInfo: c.primary,
      colorLink: c.primary,
      colorLinkHover: c.primaryHover,
      colorWarning: brand.yellow,
      colorError: c.danger,
      colorSuccess: c.success,
      colorText: c.text,
      colorTextSecondary: c.textSecondary,
      colorTextPlaceholder: c.mutedText,
      colorBorder: c.border,
      colorBorderSecondary: c.divider,
      colorBgLayout: c.surface,
      colorBgContainer: c.container,
      colorBgElevated: c.elevated,
      fontFamily: fonts.sans,
      fontFamilyCode: fonts.mono,
      borderRadius: 10,
      controlHeight: 38,
    },
    components: {
      Layout: {
        siderBg: c.container,
        headerBg: c.container,
        headerHeight: 60,
        headerPadding: "0 20px",
      },
      Menu: {
        itemBg: c.container,
        subMenuItemBg: c.container,
        itemColor: c.textSecondary,
        itemHoverBg: c.sidebarHover,
        itemHoverColor: c.text,
        itemSelectedBg: c.sidebarSelected,
        itemSelectedColor: c.text,
        itemBorderRadius: 8,
        itemMarginInline: 10,
        iconSize: 18,
        itemHeight: 36,
        itemMarginBlock: 2,
      },
      Table: {
        headerBg: c.surfaceAlt,
        headerColor: c.textSecondary,
        rowSelectedBg: c.primarySoft,
        rowSelectedHoverBg: c.primarySoftHover,
      },
      Tabs: {
        itemColor: c.textSecondary,
      },
      Card: {
        headerFontSize: 15,
      },
      Button: {
        // flat buttons: no outline-glow shadow under them
        defaultShadow: "none",
        primaryShadow: "none",
        dangerShadow: "none",
      },
    },
  };
}

/** The light theme (kept for code that does not follow the mode). */
export const theme: ThemeConfig = buildTheme("light");

/** Shared look of the big detail modals (order, product): panel body, container-coloured header. */
export const modalStyles: ModalProps["styles"] = {
  container: { background: "var(--color-panel)", padding: 0 },
  header: {
    background: "var(--ant-color-bg-container)",
    padding: "18px 24px 16px",
    margin: 0,
    borderBottom: "1px solid var(--color-divider)",
  },
  body: { padding: 20 },
};
