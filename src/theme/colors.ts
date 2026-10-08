/**
 * Buildex brand colours — the single source of truth.
 * Taken from Dommaster-frontend/styles/globals.css (hsl tokens converted to hex).
 *
 * Consumers:
 *  - Ant Design  → src/theme/antd.ts (ConfigProvider theme tokens)
 *  - Tailwind    → `tailwindColors` below, written to src/theme/tokens.css by vite/theme-tokens.ts
 *  - TS code     → `brand` (e.g. inline styles, antd `color` props)
 * Components never hard-code colour values.
 */
export const brand = {
  /** --primary: hsl(219 100% 50%) */
  primary: "#0059ff",
  primaryHover: "#004ddb",
  primarySoft: "#e5eeff",
  /** selected table row on hover */
  primarySoftHover: "#dbe7ff",
  /** very light blue panel (login illustration side) */
  primaryTint: "#f1f5ff",
  /** --secondary: hsl(43 100% 50%) */
  yellow: "#ffb700",
  /** --tertiary: hsl(223 59% 24%) */
  navy: "#192e61",
  /** sidebar item under the cursor */
  sidebarHover: "#f4f5f7",
  /** sidebar item of the open page */
  sidebarSelected: "#eceef1",
  /** --muted: hsl(210 14% 97%) — page background */
  surface: "#f6f7f8",
  /** table header / zebra background */
  surfaceAlt: "#f8f9fb",
  /** modal body background */
  panel: "#f6f7f9",
  white: "#ffffff",
  /** --muted-foreground: hsl(207 5% 60%) */
  mutedText: "#949a9e",
  /** secondary text (table header, tabs) */
  textSecondary: "#4a5568",
  /** --foreground: hsl(20 14.3% 4.1%) */
  text: "#0c0a09",
  /** --border: hsl(20 5.9% 90%) */
  border: "#e7e5e4",
  /** thin separators inside modals */
  divider: "#e5e7eb",
  /** --destructive: hsl(0 84.2% 60.2%) */
  danger: "#ef4444",
} as const;

/**
 * Colours offered for product badges (teglar). The API stores any `#RRGGBB`; the first one
 * is its default (`#2563EB`).
 */
export const badgeColors = ["#2563eb", "#15803d", brand.yellow, "#dc2626", brand.navy] as const;

/** Tailwind colour names (`bg-brand`, `text-navy`, …) → value. Generated into tokens.css. */
export const tailwindColors = {
  brand: brand.primary,
  "brand-hover": brand.primaryHover,
  "brand-soft": brand.primarySoft,
  "brand-tint": brand.primaryTint,
  "brand-yellow": brand.yellow,
  navy: brand.navy,
  surface: brand.surface,
  "surface-alt": brand.surfaceAlt,
  panel: brand.panel,
  border: brand.border,
  divider: brand.divider,
  danger: brand.danger,
} as const;
