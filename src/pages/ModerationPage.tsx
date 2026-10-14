import { ClockIcon, SearchIcon } from "@/shared/icons";
import { App, Button, Input, Tabs } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  formatWait,
  ModerationDrawer,
  ModerationStatsRow,
  ModerationTable,
  moderationError,
  RejectModal,
  useApproveModeration,
  useBulkApproveModeration,
  useModerationListQuery,
  useModerationStatsQuery,
  useRejectModeration,
  type ModerationItem,
  type ModerationStatus,
} from "@/features/moderation";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { useRowSelection } from "@/shared/ui";

const TABS: ModerationStatus[] = ["pending", "approved", "rejected"];

/** Katalog → Moderatsiya: products sent for review — approve, reject with a reason, or approve in bulk. */
export function ModerationPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [status, setStatus] = useState<ModerationStatus>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [openId, setOpenId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<{ id: number; name: string } | null>(null);
  const selection = useRowSelection<ModerationItem>();

  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const stats = useModerationStatsQuery();
  const list = useModerationListQuery({ status, search: debouncedSearch, page, pageSize });
  const approve = useApproveModeration();
  const reject = useRejectModeration();
  const bulk = useBulkApproveModeration();

  const counts: Record<ModerationStatus, number | undefined> = {
    pending: stats.data?.pending,
    approved: stats.data?.approved,
    rejected: stats.data?.rejected,
  };
  const busyId = approve.isPending ? (approve.variables ?? null) : null;
  const oldest = stats.data?.oldestWaitSeconds;

  const approveOne = (id: number) =>
    approve.mutate(id, {
      onSuccess: () => {
        message.success(t("moderation.toast.approved"));
        setOpenId(null);
      },
      onError: (error) => message.error(moderationError(error, t)),
    });

  const rejectOne = (reason: string) => {
    if (!rejecting) return;
    reject.mutate(
      { id: rejecting.id, reason },
      {
        onSuccess: () => {
          message.success(t("moderation.toast.rejected"));
          setRejecting(null);
          setOpenId(null);
        },
        onError: (error) => message.error(moderationError(error, t)),
      },
    );
  };

  const approveSelected = () =>
    bulk.mutate(selection.ids, {
      onSuccess: ({ approved, skipped }) => {
        selection.clear();
        if (approved.length > 0)
          message.success(t("moderation.toast.bulkApproved", { count: approved.length }));
        if (skipped.length > 0)
          message.warning(t("moderation.toast.bulkSkipped", { count: skipped.length }));
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });

  const changeStatus = (next: ModerationStatus) => {
    setStatus(next);
    setPage(1);
    selection.clear();
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">
            {t("nav.products")} / {t("nav.moderation")}
          </div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">
            {t("moderation.title")}{" "}
            <span className="font-semibold text-slate-400">
              {counts.pending === undefined ? "" : formatNumber(counts.pending)}
            </span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {oldest != null && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
              <ClockIcon />
              {t("moderation.oldest", { wait: formatWait(oldest, t) })}
            </span>
          )}
          <Button
            disabled={selection.ids.length === 0}
            loading={bulk.isPending}
            onClick={approveSelected}
          >
            {t("moderation.approveSelected")}
            {selection.ids.length > 0 ? ` (${selection.ids.length})` : ""}
          </Button>
        </div>
      </div>

      <ModerationStatsRow stats={stats.data} />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          activeKey={status}
          onChange={(key) => changeStatus(key as ModerationStatus)}
          className="[&_.ant-tabs-nav]:mb-0"
          items={TABS.map((tab) => ({
            key: tab,
            label: (
              <span className="inline-flex items-center gap-2">
                {t(`moderation.tabs.${tab}`)}
                <span
                  className={clsx(
                    "min-w-6 rounded-md px-1.5 text-center text-xs leading-5 font-semibold",
                    tab === status ? "bg-brand text-white" : "bg-slate-100 text-slate-600",
                  )}
                >
                  {counts[tab] === undefined ? "…" : formatNumber(counts[tab])}
                </span>
              </span>
            ),
          }))}
        />
        <Input
          allowClear
          className="w-72"
          prefix={<SearchIcon className="text-slate-400" />}
          placeholder={t("moderation.search")}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <ModerationTable
        status={status}
        items={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        loading={list.isFetching}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        }}
        rowSelection={selection.rowSelection}
        onOpen={(item) => setOpenId(item.id)}
        onApprove={(item) => approveOne(item.id)}
        onReject={(item) => setRejecting({ id: item.id, name: item.product.name })}
        busyId={busyId}
      />
      {list.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("moderation.loadError")}: {getErrorMessage(list.error)}
        </p>
      )}

      {openId !== null && (
        <ModerationDrawer
          id={openId}
          busy={approve.isPending}
          onClose={() => setOpenId(null)}
          onApprove={(item) => approveOne(item.id)}
          onReject={(item) => setRejecting({ id: item.id, name: item.product.name })}
        />
      )}
      {rejecting && (
        <RejectModal
          productName={rejecting.name}
          loading={reject.isPending}
          onCancel={() => setRejecting(null)}
          onConfirm={rejectOne}
        />
      )}
    </>
  );
}
