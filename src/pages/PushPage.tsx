import { PlusIcon } from "@/shared/icons";
import { App, Button } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  PUSH_PATH,
  PUSH_TABS,
  pushColumns,
  PushStatsCards,
  useDeletePush,
  usePushListQuery,
  usePushStatsQuery,
  type Push,
  type PushStats,
  type PushTab,
} from "@/features/push";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { RecordsTable } from "@/shared/ui";

const tabCount = (stats: PushStats | undefined, tab: PushTab) =>
  stats && (tab === "drafts" ? stats.draft : stats.published + stats.scheduled);

/** "Push xabarnomalar": notifications shown to all customers, with the last-30-days counters. */
export function PushPage() {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<PushTab>("campaigns");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const stats = usePushStatsQuery();
  const list = usePushListQuery({ tab, page, pageSize });
  const remove = useDeletePush();

  const confirmDelete = (item: Push) =>
    modal.confirm({
      title: t("push.deleteConfirm"),
      content: item.title,
      okText: t("common.delete"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        remove.mutateAsync(item.id).then(
          () => message.success(t("push.deleted")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.contents")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.push")}</h1>
        </div>
        <Button type="primary" icon={<PlusIcon />} onClick={() => navigate(`${PUSH_PATH}/new`)}>
          {t("push.add")}
        </Button>
      </div>

      <PushStatsCards stats={stats.data} />

      <div className="mb-4 flex flex-wrap gap-2">
        {PUSH_TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item);
              setPage(1);
            }}
            className={clsx(
              "flex cursor-pointer items-center gap-2 rounded-xl border-0 px-4 py-2 text-sm font-semibold transition-colors",
              tab === item
                ? "bg-brand text-white"
                : "bg-transparent text-slate-600 hover:bg-slate-100",
            )}
          >
            {t(`push.tabs.${item}`)}
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

      <RecordsTable<Push>
        columns={pushColumns(t)}
        items={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        loading={list.isFetching}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        }}
        onOpen={(item) => navigate(`${PUSH_PATH}/${item.id}`)}
        onDelete={confirmDelete}
      />
      {list.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("push.loadError")}: {list.error.message}
        </p>
      )}
    </>
  );
}
