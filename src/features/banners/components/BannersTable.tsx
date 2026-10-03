import { HolderOutlined } from "@ant-design/icons";
import { Table, Tag, type TableColumnsType } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatDateTime } from "@/shared/lib/format";
import { STATUS_COLOR } from "../model/constants";
import type { Banner } from "../model/types";

interface Props {
  banners: Banner[];
  loading: boolean;
  /** the whole tab is on screen — rows can be dragged to reorder */
  canReorder: boolean;
  onOpen: (id: number) => void;
  /** every id of the tab in the new order */
  onReorder: (ids: number[]) => void;
}

/** Small thumbnail; a grey box with the aspect ratio when there is no picture. */
function Thumb({
  src,
  className,
  label,
}: {
  src: string | null;
  className: string;
  label: string;
}) {
  return (
    <span
      className={clsx(
        "grid place-items-center overflow-hidden rounded-md border border-slate-200 bg-slate-100 font-mono text-[10px] text-slate-400",
        className,
      )}
    >
      {src ? <img src={src} alt="" loading="lazy" className="size-full object-cover" /> : label}
    </span>
  );
}

function Channel({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={clsx(
        "rounded px-1.5 py-0.5 text-[11px] leading-4 font-bold",
        on ? "bg-brand-soft text-brand" : "bg-slate-100 text-slate-400 line-through",
      )}
    >
      {label}
    </span>
  );
}

export function BannersTable({ banners, loading, canReorder, onOpen, onReorder }: Props) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const drop = (targetId: number) => {
    if (dragging === null || dragging === targetId) return;
    const ids = banners.map((banner) => banner.id);
    const from = ids.indexOf(dragging);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ...ids.splice(from, 1));
    onReorder(ids);
  };

  const columns: TableColumnsType<Banner> = [
    {
      key: "handle",
      width: 28,
      render: () => (canReorder ? <HolderOutlined className="cursor-grab text-slate-300" /> : null),
    },
    {
      key: "image",
      title: t("banners.columns.image"),
      width: 150,
      render: (_, banner) => (
        <span className="flex items-center gap-1.5">
          <Thumb src={banner.desktopImage} className="h-8 w-24" label="16:5" />
          <Thumb src={banner.mobileImage} className="size-8" label="1:1" />
        </span>
      ),
    },
    {
      key: "name",
      title: t("banners.columns.name"),
      width: 240,
      render: (_, banner) => (
        <div className="leading-tight">
          <div className="font-bold">{banner.name}</div>
          <div className="font-mono text-xs text-slate-400">{banner.code}</div>
        </div>
      ),
    },
    {
      key: "channels",
      title: t("banners.columns.channels"),
      width: 160,
      render: (_, banner) => (
        <span className="flex flex-wrap gap-1">
          <Channel label={t("banners.channels.site")} on={banner.showOnSite} />
          <Channel label="iOS" on={banner.showOnIos} />
          <Channel label="Android" on={banner.showOnAndroid} />
        </span>
      ),
    },
    {
      key: "link",
      title: t("banners.columns.link"),
      width: 240,
      render: (_, banner) => {
        const value =
          banner.linkType === "page"
            ? banner.page
            : banner.linkType === "url"
              ? banner.link
              : (banner.target?.name ?? "—");
        const mono = banner.linkType === "page" || banner.linkType === "url";
        return (
          <div className="leading-tight">
            <div className="text-xs text-slate-500">
              {t(`banners.linkTypes.${banner.linkType}`)}
            </div>
            <div
              className={clsx(
                "break-all",
                mono ? "font-mono text-[13px]" : "font-bold",
                banner.linkType === "url" && "text-red-700",
              )}
            >
              {value}
            </div>
          </div>
        );
      },
    },
    {
      key: "period",
      title: t("banners.columns.period"),
      width: 170,
      render: (_, banner) => (
        <div className="text-[13px] leading-tight tabular-nums">
          <div>{formatDateTime(banner.startsAt)}</div>
          <div className="text-slate-500">
            → {banner.endsAt ? formatDateTime(banner.endsAt) : t("banners.noEnd")}
          </div>
        </div>
      ),
    },
    {
      key: "position",
      title: t("banners.columns.position"),
      width: 80,
      align: "right",
      render: (_, banner) => <span className="tabular-nums">{banner.position}</span>,
    },
    {
      key: "status",
      title: t("banners.columns.status"),
      width: 170,
      render: (_, banner) => (
        <span className="flex flex-col items-start gap-1">
          <Tag color={STATUS_COLOR[banner.status]} variant="filled" className="m-0 font-semibold">
            {t(`banners.status.${banner.status}`)}
          </Tag>
          {banner.linkType === "url" && banner.status !== "archived" && (
            <Tag color="red" className="m-0 font-semibold">
              {t("banners.needsCheck")}
            </Tag>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table<Banner>
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={banners}
        loading={loading}
        pagination={false}
        scroll={{ x: 1180 }}
        onRow={(banner) => ({
          draggable: canReorder,
          className: clsx(
            "cursor-pointer",
            over === banner.id && dragging !== banner.id && "bg-brand/10",
            dragging === banner.id && "opacity-40",
          ),
          onClick: () => onOpen(banner.id),
          onDragStart: (event) => {
            event.dataTransfer.effectAllowed = "move";
            setDragging(banner.id);
          },
          onDragOver: (event) => {
            if (dragging === null) return;
            event.preventDefault();
            setOver(banner.id);
          },
          onDrop: (event) => {
            event.preventDefault();
            drop(banner.id);
            setDragging(null);
            setOver(null);
          },
          onDragEnd: () => {
            setDragging(null);
            setOver(null);
          },
        })}
        locale={{ emptyText: <div className="py-10 text-slate-500">{t("common.noData")}</div> }}
      />
      {canReorder && banners.length > 1 && (
        <p className="m-0 border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          {t("banners.dragHint")}
        </p>
      )}
    </div>
  );
}
