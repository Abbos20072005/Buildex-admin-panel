import { MoreIcon } from "@/shared/icons";
import { App, Button, Dropdown, Image, Input } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { useEditMessage, useRemoveMessage } from "../hooks/queries";
import { chatTime } from "../lib/display";
import type { ChatMessage } from "../model/types";

/** One message: the customer's on the left, an operator's answer on the right (editable). */
export function MessageBubble({ message }: { message: ChatMessage }) {
  const { t } = useTranslation();
  const { message: toast, modal } = App.useApp();
  const edit = useEditMessage();
  const remove = useRemoveMessage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const mine = message.isAnswer;
  const edited = message.updatedAt !== message.createdAt && mine;

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
    <div className={clsx("flex", mine ? "justify-end" : "justify-start")}>
      <div className={clsx("max-w-[78%] min-w-0", mine && "flex flex-col items-end")}>
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
              "rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap",
              mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-slate-100",
            )}
          >
            {message.image && (
              <Image
                src={message.image}
                alt=""
                width={220}
                className="mb-1 rounded-lg object-cover"
              />
            )}
            {message.text}
          </div>
        )}
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
          <span className="tabular-nums">{chatTime(message.createdAt)}</span>
          {edited && <span>· {t("chats.message.edited")}</span>}
          {mine && !editing && (
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  // a picture can't be changed, only its text
                  ...(message.text || !message.image
                    ? [{ key: "edit", label: t("common.edit") }]
                    : []),
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
              />
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
}
