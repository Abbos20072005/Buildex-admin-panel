import { PlusIcon } from "@/shared/icons";
import { App, Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BulkBar, useRowSelection } from "@/shared/ui";
import { useNavigate } from "react-router-dom";
import {
  BANNERS_PATH,
  BannersTable,
  StatsCards,
  TABS,
  useBannersQuery,
  useBannerStatsQuery,
  useDeleteBanner,
  useReorderBanners,
  type BannerStats,
  type BannerTab,
  useBulkSetBannerVisible,
  type Banner,
} from "@/features/banners";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";

const tabCount = (stats: BannerStats | undefined, tab: BannerTab) =>
  stats &&
  {
    site_home: stats.siteHome,
    app_home: stats.appHome,
    catalog: stats.catalog,
    archive: stats.archived,
  }[tab];

export function BannersPage() {
  const { t } = useTranslation();
  const selection = useRowSelection<Banner>();
  const bulk = useBulkSetBannerVisible();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<BannerTab>("site_home");

  const stats = useBannerStatsQuery();
  const banners = useBannersQuery(tab);
  const reorder = useReorderBanners();
  const remove = useDeleteBanner();

  const items = banners.data?.items ?? [];
  // the order is the order of the whole tab — only possible when all of it is on screen
  const canReorder = items.length === banners.data?.total && items.length > 1;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.contents")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.banners")}</h1>
        </div>
        <Button type="primary" icon={<PlusIcon />} onClick={() => navigate(`${BANNERS_PATH}/new`)}>
          {t("banners.add")}
        </Button>
      </div>

      <StatsCards stats={stats.data} />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={clsx(
              "flex cursor-pointer items-center gap-2 rounded-xl border-0 px-4 py-2 text-sm font-semibold transition-colors",
              tab === item
                ? "bg-brand text-white"
                : "bg-transparent text-slate-600 hover:bg-slate-100",
            )}
          >
            {t(`banners.tabs.${item}`)}
            <span
              className={clsx(
                "rounded-full px-2 text-xs leading-5",
                tab === item ? "bg-white/20" : "bg-slate-100 text-slate-600",
              )}
            >
              {tabCount(stats.data, item) ?? "…"}
            </span>
          </button>
        ))}
      </div>

      <BulkBar
        ids={selection.ids}
        mutation={bulk}
        onClear={selection.clear}
        options={[
          { value: true, label: t("bulk.active") },
          { value: false, label: t("bulk.archived") },
        ]}
      />

      <BannersTable
        rowSelection={selection.rowSelection}
        banners={items}
        loading={banners.isFetching}
        canReorder={canReorder}
        deletingId={remove.isPending ? remove.variables : null}
        onOpen={(id) => navigate(`${BANNERS_PATH}/${id}`)}
        onDelete={(id) =>
          remove.mutate(id, {
            onSuccess: () => message.success(t("banners.deleted")),
            onError: (error) => message.error(getErrorMessage(error)),
          })
        }
        onReorder={(ids) =>
          reorder.mutate(ids, { onError: (error) => message.error(getErrorMessage(error)) })
        }
      />
      {banners.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("banners.loadError")}: {banners.error.message}
        </p>
      )}
    </>
  );
}
