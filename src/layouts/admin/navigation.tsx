import {
  BoxIcon,
  CartIcon,
  FileIcon,
  GaugeIcon,
  HeadsetIcon,
  ListIcon,
  PlayCircleIcon,
  SettingsIcon,
  SyncIcon,
  TrendIcon,
  UserCheckIcon,
  UsersIcon,
} from "@/shared/icons";
import type { ReactNode } from "react";

/** Live counters shown next to menu items (all of them come from the API). */
export type NavBadge = "newOrders" | "productsInReview" | "productsTotal";

export interface NavLeaf {
  path: string;
  /** i18n key */
  label: string;
  icon?: ReactNode;
  badge?: NavBadge;
}

export interface NavGroup {
  key: string;
  label: string;
  icon: ReactNode;
  children: NavLeaf[];
}

export type NavItem = NavLeaf | NavGroup;

export const isNavGroup = (item: NavItem): item is NavGroup => "children" in item;

/** Sidebar structure. Pages that aren't built yet render <ComingSoonPage>. */
export const NAVIGATION: NavItem[] = [
  { path: "/dashboard", label: "nav.dashboard", icon: <GaugeIcon /> },
  { path: "/today", label: "nav.today", icon: <FileIcon /> },
  {
    key: "orders",
    label: "nav.orders",
    icon: <CartIcon />,
    children: [
      { path: "/orders", label: "nav.allOrders", badge: "newOrders" },
      { path: "/orders/returns", label: "nav.returns" },
    ],
  },
  { path: "/customers", label: "nav.customers", icon: <UsersIcon /> },
  { path: "/managers", label: "nav.managers", icon: <UserCheckIcon /> },
  {
    key: "support",
    label: "nav.support",
    icon: <HeadsetIcon />,
    children: [
      { path: "/support/requests", label: "nav.requests" },
      { path: "/support/scripts", label: "nav.scripts" },
    ],
  },
  {
    key: "products",
    label: "nav.products",
    icon: <BoxIcon />,
    children: [
      { path: "/products", label: "nav.allProducts", badge: "productsTotal" },
      { path: "/products/unlinked", label: "nav.unlinkedSku" },
      { path: "/products/moderation", label: "nav.moderation", badge: "productsInReview" },
    ],
  },
  {
    key: "attributes",
    label: "nav.attributes",
    icon: <ListIcon />,
    children: [
      { path: "/attributes/categories", label: "nav.categories" },
      { path: "/attributes/brands", label: "nav.brands" },
      { path: "/attributes/characteristics", label: "nav.characteristics" },
      { path: "/attributes/tags", label: "nav.tags" },
      { path: "/attributes/partner-brands", label: "nav.partnerBrands" },
      { path: "/attributes/models", label: "nav.models" },
    ],
  },
  {
    key: "content",
    label: "nav.contents",
    icon: <PlayCircleIcon />,
    children: [
      { path: "/content/banners", label: "nav.banners" },
      { path: "/content/news", label: "nav.news" },
      { path: "/content/ad-blocks", label: "nav.adBlocks" },
      { path: "/content/home", label: "nav.homePage" },
      { path: "/content/pages", label: "nav.pages" },
      { path: "/content/push", label: "nav.push" },
      { path: "/content/media", label: "nav.media" },
      { path: "/content/settings", label: "nav.settings" },
    ],
  },
  {
    key: "analytics",
    label: "nav.analytics",
    icon: <TrendIcon />,
    children: [
      { path: "/analytics/sales", label: "nav.sales" },
      { path: "/analytics/launch", label: "nav.launchMetrics" },
    ],
  },
  { path: "/sync", label: "nav.sync", icon: <SyncIcon /> },
];

/** Pinned to the bottom of the sidebar, under a divider. */
export const NAVIGATION_BOTTOM: NavItem[] = [
  {
    key: "system",
    label: "nav.systemSettings",
    icon: <SettingsIcon />,
    children: [{ path: "/settings/staff", label: "nav.staff" }],
  },
];

/** every leaf route (used by the router for the "coming soon" pages) */
export const NAV_LEAVES: NavLeaf[] = [...NAVIGATION, ...NAVIGATION_BOTTOM].flatMap((item) =>
  isNavGroup(item) ? item.children : [item],
);
