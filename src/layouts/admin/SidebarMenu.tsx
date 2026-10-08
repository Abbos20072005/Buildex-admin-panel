import { Menu, type MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useOrderStatsQuery } from "@/features/orders";
import { useProductsInReviewCount, useProductsTotalCount } from "@/features/products";
import { isNavGroup, NAV_LEAVES, type NavBadge, type NavItem, type NavLeaf } from "./navigation";

function Counter({ value }: { value: number }) {
  return (
    <span className="ml-auto min-w-7 rounded-full bg-surface px-2 text-center text-xs leading-5 font-bold text-slate-600">
      {value}
    </span>
  );
}

interface Props {
  /** the part of the sidebar structure this menu shows */
  nav: NavItem[];
  onNavigate?: () => void;
}

export function SidebarMenu({ nav, onNavigate }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // detail pages (/products/12) keep their menu item highlighted: the longest matching path wins
  const selectedKey =
    NAV_LEAVES.filter((leaf) => pathname === leaf.path || pathname.startsWith(`${leaf.path}/`))
      .map((leaf) => leaf.path)
      .sort((a, b) => b.length - a.length)[0] ?? pathname;
  const { data: orderStats } = useOrderStatsQuery();
  const { data: inReview } = useProductsInReviewCount();
  const { data: total } = useProductsTotalCount();

  const badges: Record<NavBadge, number> = {
    newOrders: orderStats?.pending ?? 0,
    productsInReview: inReview ?? 0,
    productsTotal: total ?? 0,
  };

  const leafLabel = (leaf: NavLeaf) => (
    <span className="flex items-center gap-2">
      <span className="truncate">{t(leaf.label)}</span>
      {leaf.badge && badges[leaf.badge] > 0 && <Counter value={badges[leaf.badge]} />}
    </span>
  );

  const items: MenuProps["items"] = nav.map((item) =>
    isNavGroup(item)
      ? {
          key: item.key,
          icon: item.icon,
          label: t(item.label),
          children: item.children.map((child) => ({ key: child.path, label: leafLabel(child) })),
        }
      : { key: item.path, icon: item.icon, label: leafLabel(item) },
  );

  return (
    <Menu
      mode="inline"
      inlineIndent={20}
      items={items}
      selectedKeys={[selectedKey]}
      onClick={({ key }) => {
        navigate(key);
        onNavigate?.();
      }}
      className="border-e-0! font-medium"
    />
  );
}
