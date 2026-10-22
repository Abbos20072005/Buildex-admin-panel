import { MoreIcon } from "@/shared/icons";
import { App, Button, Dropdown, Image, Input } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { useEditMessage, useRemoveMessage } from "../hooks/queries";
import { chatTime } from "../lib/display";
import type { ChatMessage } from "../model/types";
import { MessageStatus } from "./MessageStatus";

interface Props {
  message: ChatMessage;
  /** the previous message is from the same side a moment ago: closer together, like in Telegram */
  grouped: boolean;
}

/** One message: the customer's on the left, an operator's answer on the right (editable). */
export function MessageBubble({ message, grouped }: Props) {
  const { t } = useTranslation();
  const { message: toast, modal } = App.useApp();
  const edit = useEditMessage();
  const remove = useRemoveMessage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const mine = message.isAnswer;
  const edited = mine && message.updatedAt !== message.createdAt;

  const save = () => {
    const text = draft.trim();
    if (!text || text === message.text) return setEditing(false);
    edit.mutate(
      { id: message.id, text },
      {
        onSuccess: () => {
          toast.success(t("common.saved"));
          setEditing(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  };

  const confirmDelete = () =>
    modal.confirm({
      title: t("chats.message.deleteConfirm"),
      okText: t("common.delete"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        remove.mutateAsync(message.id).catch((error: unknown) => {
          toast.error(getErrorMessage(error));
        }),
    });

  return (
    <div
      className={clsx(
        "group flex items-end gap-1",
        mine ? "justify-end" : "justify-start",
        grouped ? "mt-0.5" : "mt-3",
      )}
    >
      {mine && !editing && (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              // a picture can't be changed, only its text
              ...(message.text || !message.image ? [{ key: "edit", label: t("common.edit") }] : []),
              { key: "delete", label: t("common.delete"), danger: true },
            ],
            onClick: ({ key }) => {
              if (key === "edit") {
                setDraft(message.text);
                setEditing(true);
              } else confirmDelete();
            },
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreIcon />}
            aria-label={t("common.actions")}
            className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          />
        </Dropdown>
      )}

      {editing ? (
        <div className="w-80 max-w-full space-y-2">
          <Input.TextArea
            autoFocus
            autoSize={{ minRows: 2, maxRows: 8 }}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button size="small" onClick={() => setEditing(false)}>
              {t("common.cancel")}
            </Button>
            <Button size="small" type="primary" loading={edit.isPending} onClick={save}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={clsx(
            "max-w-[78%] min-w-0 rounded-2xl px-3 py-1.5 text-sm break-words whitespace-pre-wrap",
            mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-white shadow-sm",
          )}
        >
          {message.image && (
            <Image
              src={message.image}
              alt=""
              width={240}
              className="mb-1 rounded-lg object-cover"
            />
          )}
          {message.text}
          {/* time and tick sit at the bottom right of the bubble, the text wraps around them */}
          <span
            className={clsx(
              "relative top-1 float-right ml-3 inline-flex translate-y-0.5 items-center gap-1 text-[11px] leading-5 tabular-nums",
              mine ? "text-white/70" : "text-slate-400",
            )}
          >
            {edited && <span>{t("chats.message.edited")}</span>}
            {chatTime(message.createdAt)}
            {mine && <MessageStatus state="sent" />}
          </span>
        </div>
      )}
    </div>
  );
}
