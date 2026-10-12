import { EditIcon, GripIcon, MoreIcon, PlusIcon, TrashIcon } from "@/shared/icons";
import { App, Button, Card, Dropdown, Skeleton, Tag } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { describeBlock } from "../lib/describe";
import { BLOCK_TYPES } from "../model/constants";
import type { BlockType, Channel, HomeBlock } from "../model/types";
import { useDeleteBlock, useReorderBlocks, useSetBlockVisible } from "../hooks/queries";

interface Props {
  channel: Channel;
  blocks: HomeBlock[];
  loading: boolean;
  onEdit: (block: HomeBlock) => void;
  onAdd: (type: BlockType) => void;
}

const STATUS_COLOR = { visible: "green", hidden: "default", rule_hidden: "gold" } as const;

/** The blocks of the page: drag to reorder, "⋯" to edit / hide / delete, "+ Blok qo'shish". */
export function BlocksCard({ channel, blocks, loading, onEdit, onAdd }: Props) {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const reorder = useReorderBlocks(channel);
  const setVisible = useSetBlockVisible();
  const remove = useDeleteBlock();

  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const drop = (targetId: number) => {
    if (dragging === null || dragging === targetId) return;
    const ids = blocks.map((block) => block.id);
    const from = ids.indexOf(dragging);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ...ids.splice(from, 1));
    reorder.mutate(ids, { onError: (error) => message.error(getErrorMessage(error)) });
  };

  const confirmDelete = (block: HomeBlock) =>
    modal.confirm({
      title: t("home.deleteConfirm"),
      content: block.title,
      okText: t("common.delete"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        remove.mutateAsync(block.id).then(
          () => message.success(t("common.deleted")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  return (
    <Card
      title={<span className="text-base font-bold">{t("home.blocks")}</span>}
      extra={<span className="text-xs text-slate-500">{t("home.orderHint")}</span>}
      styles={{ body: { padding: 0 } }}
    >
      {loading ? (
        <div className="p-5">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {blocks.map((block, index) => {
            const hidden = block.status !== "visible";
            return (
              <li
                key={block.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  setDragging(block.id);
                }}
                onDragOver={(event) => {
                  if (dragging === null || dragging === block.id) return;
                  event.preventDefault();
                  setOver(block.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  drop(block.id);
                  setDragging(null);
                  setOver(null);
                }}
                onDragEnd={() => {
                  setDragging(null);
                  setOver(null);
                }}
                className={clsx(
                  "flex items-center gap-3 border-b border-slate-100 px-5 py-3",
                  over === block.id && dragging !== block.id && "bg-brand/10",
                  dragging === block.id && "opacity-40",
                )}
              >
                <span className="cursor-grab text-slate-300" title={t("home.dragHint")}>
                  <GripIcon />
                </span>
                <span className="w-5 text-center text-sm text-slate-500 tabular-nums">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onEdit(block)}
                  className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
                >
                  <div className={clsx("truncate font-semibold", hidden && "text-slate-400")}>
                    {block.title}
                  </div>
                  <div className="truncate text-xs text-slate-500">{describeBlock(block, t)}</div>
                </button>
                <span className="hidden gap-1 sm:flex">
                  {block.showOnSite && (
                    <Tag color="blue" variant="filled" className="m-0 font-semibold">
                      {t("home.channels.site")}
                    </Tag>
                  )}
                  {block.showInApp && (
                    <Tag color="blue" variant="filled" className="m-0 font-semibold">
                      {t("home.channels.app")}
                    </Tag>
                  )}
                </span>
                <Tag
                  color={STATUS_COLOR[block.status]}
                  variant="filled"
                  className="m-0 shrink-0 font-semibold"
                >
                  {t(`home.status.${block.status}`)}
                </Tag>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      { key: "edit", icon: <EditIcon />, label: t("common.edit") },
                      {
                        key: "visible",
                        label: t(block.isVisible ? "home.hide" : "home.show"),
                      },
                      { type: "divider" },
                      {
                        key: "delete",
                        icon: <TrashIcon />,
                        label: t("common.delete"),
                        danger: true,
                      },
                    ],
                    onClick: ({ key }) => {
                      if (key === "edit") onEdit(block);
                      else if (key === "delete") confirmDelete(block);
                      else
                        setVisible.mutate(
                          { id: block.id, isVisible: !block.isVisible },
                          { onError: (error) => message.error(getErrorMessage(error)) },
                        );
                    },
                  }}
                >
                  <Button type="text" icon={<MoreIcon />} aria-label={t("common.actions")} />
                </Dropdown>
              </li>
            );
          })}
          {blocks.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-slate-400">{t("common.noData")}</li>
          )}
        </ul>
      )}

      <div className="p-4">
        <Dropdown
          trigger={["click"]}
          placement="topLeft"
          menu={{
            items: BLOCK_TYPES.map((type) => ({ key: type, label: t(`home.types.${type}`) })),
            onClick: ({ key }) => onAdd(key as BlockType),
          }}
        >
          <Button icon={<PlusIcon />}>{t("home.addBlock")}</Button>
        </Dropdown>
      </div>
    </Card>
  );
}
