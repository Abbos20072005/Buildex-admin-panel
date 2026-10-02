import {
  CodeSandboxOutlined,
  DashboardOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
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
  { path: "/dashboard", label: "nav.dashboard", icon: <DashboardOutlined /> },
  { path: "/today", label: "nav.today", icon: <FileTextOutlined /> },
  { path: "/orders", label: "nav.orders", icon: <ShoppingCartOutlined />, badge: "newOrders" },
  {
    key: "products",
    label: "nav.products",
    icon: <CodeSandboxOutlined />,
    children: [
      { path: "/products", label: "nav.allProducts", badge: "productsTotal" },
      { path: "/products/unlinked", label: "nav.unlinkedSku" },
      { path: "/products/moderation", label: "nav.moderation", badge: "productsInReview" },
    ],
  },
  {
    key: "attributes",
    label: "nav.attributes",
    icon: <UnorderedListOutlined />,
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
    icon: <PlayCircleOutlined />,
    children: [
      { path: "/content/banners", label: "nav.banners" },
      { path: "/content/home", label: "nav.homePage" },
      { path: "/content/pages", label: "nav.pages" },
      { path: "/content/push", label: "nav.push" },
      { path: "/content/media", label: "nav.media" },
      { path: "/content/settings", label: "nav.settings" },
    ],
  },
];

/** every leaf route (used by the router for the "coming soon" pages) */
export const NAV_LEAVES: NavLeaf[] = NAVIGATION.flatMap((item) =>
  isNavGroup(item) ? item.children : [item],
);

/** keys of every group — they are all expanded by default, as in the design */
export const NAV_GROUP_KEYS: string[] = NAVIGATION.filter(isNavGroup).map((group) => group.key);
