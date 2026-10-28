import { Button, Table, type TableColumnsType, type TableProps } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatDateTime } from "@/shared/lib/format";
import { formatWait } from "../lib/wait";
import type { ModerationItem, ModerationStatus } from "../model/types";

const DAY = 24 * 60 * 60;

interface Props {
  status: ModerationStatus;
  items: ModerationItem[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  rowSelection?: TableProps<ModerationItem>["rowSelection"];
  onOpen: (item: ModerationItem) => void;
  onApprove: (item: ModerationItem) => void;
  onReject: (item: ModerationItem) => void;
  /** the row whose approve / reject request is in flight */
  busyId: number | null;
}

/** "To‘liq" or "2 ta yetishmaydi · RU nomi". */
function ReadinessChip({ item }: { item: ModerationItem }) {
  const { t } = useTranslation();
  const { ready, missing } = item.readiness;
  const count = item.readiness.total - item.readiness.done;
  return (
    <span
      className={clsx(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ready ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700",
      )}
    >
      {ready
        ? t("moderation.ready")
        : `${t("moderation.missingCount", { count })}${
            missing[0] ? ` · ${t(`moderation.checks.${missing[0]}`)}` : ""
          }`}
    </span>
  );
}

/** Queue (pending) or history (approved / rejected) of the moderation rows. */
export function ModerationTable({
  status,
  items,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  rowSelection,
  onOpen,
  onApprove,
  onReject,
  busyId,
}: Props) {
  const { t } = useTranslation();
  const pending = status === "pending";

  const product: TableColumnsType<ModerationItem>[number] = {
    key: "product",
    title: t("moderation.columns.product"),
    render: (_, item) => (
      <div className="min-w-0">
        <div className="truncate font-semibold">{item.product.name}</div>
        <div className="font-mono text-xs text-slate-400">
          {item.product.articulCode ?? item.product.productCode}
        </div>
      </div>
    ),
  };
  const submittedBy: TableColumnsType<ModerationItem>[number] = {
    key: "submittedBy",
    title: t("moderation.columns.submittedBy"),
    width: 150,
    render: (_, item) => item.submittedBy?.name || "—",
  };
  const waiting: TableColumnsType<ModerationItem>[number] = {
    key: "waiting",
    title: pending ? t("moderation.columns.waiting") : t("moderation.columns.waited"),
    width: 130,
    render: (_, item) => (
      <span
        className={clsx(
          "tabular-nums",
          pending && item.waitingSeconds >= 2 * DAY
            ? "font-semibold text-amber-700"
            : "text-slate-600",
        )}
      >
        {formatWait(item.waitingSeconds, t)}
      </span>
    ),
  };

  const columns: TableColumnsType<ModerationItem> = pending
    ? [
        product,
        submittedBy,
        waiting,
        {
          key: "readiness",
          title: t("moderation.columns.readiness"),
          width: 280,
          render: (_, item) => <ReadinessChip item={item} />,
        },
        {
          key: "actions",
          title: t("moderation.columns.actions"),
          width: 230,
          render: (_, item) => (
            // the buttons must not open the drawer
            <span className="flex gap-2" onClick={(event) => event.stopPropagation()}>
              <Button
                type="primary"
                className="btn-success"
                size="small"
                disabled={!item.readiness.ready || (busyId !== null && busyId !== item.id)}
                loading={busyId === item.id}
                onClick={() => onApprove(item)}
              >
                {t("moderation.approve")}
              </Button>
              <Button size="small" danger disabled={busyId !== null} onClick={() => onReject(item)}>
                {t("moderation.reject")}
              </Button>
            </span>
          ),
        },
      ]
    : [
        product,
        submittedBy,
        {
          key: "reviewedBy",
          title: t("moderation.columns.reviewedBy"),
          width: 150,
          render: (_, item) => item.reviewedBy?.name || "—",
        },
        {
          key: "reviewedAt",
          title: t("moderation.columns.reviewedAt"),
          width: 160,
          render: (_, item) => (
            <span className="text-slate-600 tabular-nums">{formatDateTime(item.reviewedAt)}</span>
          ),
        },
        waiting,
        ...(status === "rejected"
          ? [
              {
                key: "reason",
                title: t("moderation.columns.reason"),
                render: (_: unknown, item: ModerationItem) => (
                  <span className="line-clamp-2 text-slate-600">{item.reason}</span>
                ),
              },
            ]
          : []),
      ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<ModerationItem>
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={items}
        loading={loading}
        scroll={{ x: 900 }}
        rowSelection={pending ? rowSelection : undefined}
        onRow={(item) => ({
          className: "cursor-pointer",
          onClick: (event) => {
            if ((event.target as HTMLElement).closest(".ant-table-selection-column")) return;
            onOpen(item);
          },
        })}
        locale={{
          emptyText: (
            <div className="py-10 text-slate-500">
              {pending ? t("moderation.emptyQueue") : t("common.noData")}
            </div>
          ),
        }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["20", "50", "100"],
          onChange: onPageChange,
        }}
      />
    </div>
  );
}
