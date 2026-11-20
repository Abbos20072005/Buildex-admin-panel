import { EditIcon, TrashIcon } from "@/shared/icons";
import { App, Button, Input, Popconfirm } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { formatDateTime } from "@/shared/lib/format";
import {
  useEditReplyMutation,
  useRemoveReplyMutation,
} from "../hooks/queries";
import type { FeedbackKind, FeedbackReply } from "../model/types";

interface Props {
  kind: FeedbackKind;
  reply: FeedbackReply;
}

/** One answer under a review or a question: the shop's on the right, a customer's on the left. */
export function ReplyBubble({ kind, reply }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const edit = useEditReplyMutation(kind);
  const remove = useRemoveReplyMutation(kind);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reply.text);

  const save = () => {
    const text = draft.trim();
    if (!text) return;
    edit.mutate(
      { id: reply.id, text },
      {
        onSuccess: () => {
          setEditing(false);
          message.success(t("feedback.toast.replySaved"));
        },
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );
  };

  return (
    <div className={clsx("flex", reply.isAdmin ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[85%] min-w-[220px] rounded-2xl px-3.5 py-2.5",
          reply.isAdmin ? "bg-brand-soft" : "bg-slate-100",
        )}
      >
        <div className="mb-1 flex items-center justify-between gap-3 text-xs">
          <span className={clsx("font-semibold", reply.isAdmin ? "text-brand" : "text-slate-600")}>
            {reply.isAdmin ? t("feedback.shop") : reply.authorName || t("feedback.guest")}
          </span>
          <span className="text-slate-400 tabular-nums">{formatDateTime(reply.createdAt)}</span>
        </div>

        {editing ? (
          <div className="space-y-2">
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 8 }}
              maxLength={2000}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                size="small"
                onClick={() => {
                  setEditing(false);
                  setDraft(reply.text);
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="small"
                type="primary"
                loading={edit.isPending}
                disabled={!draft.trim()}
                onClick={save}
              >
                {t("common.save")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm break-words whitespace-pre-wrap">{reply.text}</div>
            <div className="mt-1 flex justify-end gap-1">
              {reply.isAdmin && (
                <Button
                  type="text"
                  size="small"
                  icon={<EditIcon />}
                  aria-label={t("common.edit")}
                  onClick={() => setEditing(true)}
                />
              )}
              <Popconfirm
                title={t("feedback.reply.deleteConfirm")}
                okText={t("common.delete")}
                okButtonProps={{ danger: true }}
                cancelText={t("common.cancel")}
                onConfirm={() =>
                  remove.mutate(reply.id, {
                    onSuccess: () => message.success(t("feedback.toast.replyDeleted")),
                    onError: (error) => message.error(getErrorMessage(error)),
                  })
                }
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<TrashIcon />}
                  loading={remove.isPending}
                  aria-label={t("common.delete")}
                />
              </Popconfirm>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
