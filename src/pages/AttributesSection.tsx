import { PlusIcon, SearchIcon } from "@/shared/icons";
import { Button, Input } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { isNavGroup, NAVIGATION } from "@/layouts/admin/navigation";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";

/** Sub-sections of "Atributlar" (categories, brands, characteristics…) as tabs. */
function AttributesTabs() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const group = NAVIGATION.find((item) => isNavGroup(item) && item.key === "attributes");
  if (!group || !isNavGroup(group)) return null;

  return (
    <nav className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
      {group.children.map((leaf) => (
        <Link
          key={leaf.path}
          to={leaf.path}
          className={clsx(
            "rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors",
            pathname === leaf.path
              ? "bg-brand text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          {t(leaf.label)}
        </Link>
      ))}
    </nav>
  );
}

interface Props {
  /** i18n key of the section: "nav.categories", "nav.characteristics"… */
  titleKey: string;
  count: number | undefined;
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder: string;
  addLabel: string;
  onAdd: () => void;
}

/** Breadcrumb, title with counter, search, "add" button and the section tabs. */
export function AttributesSection({
  titleKey,
  count,
  search,
  onSearch,
  searchPlaceholder,
  addLabel,
  onAdd,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">
            {t("nav.attributes")} / {t(titleKey)}
          </div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">
            {t(titleKey)}{" "}
            {count !== undefined && (
              <span className="font-medium text-slate-400">{formatNumber(count)}</span>
            )}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            allowClear
            className="w-72"
            prefix={<SearchIcon className="text-slate-400" />}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
          <Button type="primary" icon={<PlusIcon />} onClick={onAdd}>
            {addLabel}
          </Button>
        </div>
      </div>

      <AttributesTabs />
    </>
  );
}
