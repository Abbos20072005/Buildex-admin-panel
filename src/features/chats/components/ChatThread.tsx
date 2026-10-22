import { Alert, App, Button, Popconfirm, Skeleton, Tag } from "antd";
import dayjs from "dayjs";
import { Fragment, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { formatPhone } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import { useChatMessagesQuery, useRemoveChat } from "../hooks/queries";
import { chatTitle } from "../lib/display";
import type { Chat } from "../model/types";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";

interface Props {
  chat: Chat;
  /** small screens: back to the list */
  onBack: () => void;
  onDeleted: () => void;
}

/** One conversation: the messages (oldest first, scrolled to the newest) and the reply box. */
export function ChatThread({ chat, onBack, onDeleted }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const query = useChatMessagesQuery(chat.id);
  const remove = useRemoveChat();
  const messages = query.data ?? [];
  const bottom = useRef<HTMLDivElement>(null);
  const lastId = messages.at(-1)?.id;

  // a new message (either side) scrolls the thread down
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [chat.id, lastId]);

  const scrollDown = () => bottom.current?.scrollIntoView({ block: "end", behavior: "smooth" });

  const handleDelete = () =>
    remove.mutate(chat.id, {
      onSuccess: () => {
        message.success(t("chats.toast.chatDeleted"));
        onDeleted();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <Button className="lg:hidden" size="small" onClick={onBack}>
          ‹ {t("chats.back")}
        </Button>
        <InitialsAvatar name={chatTitle(chat, t)} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold">{chatTitle(chat, t)}</span>
            {!chat.customer && (
              <Tag variant="filled" className="m-0">
                {t("chats.guest")}
              </Tag>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {chat.customer?.phone && (
              <span className="font-mono">{formatPhone(chat.customer.phone)} · </span>
            )}
            {t("chats.thread.count", { count: chat.messagesCount })}
          </div>
        </div>
        <Popconfirm
          title={t("chats.thread.deleteConfirm")}
          description={t("chats.thread.deleteHint")}
          okText={t("common.delete")}
          okButtonProps={{ danger: true }}
          cancelText={t("common.cancel")}
          onConfirm={handleDelete}
        >
          <Button danger loading={remove.isPending}>
            {t("chats.thread.delete")}
          </Button>
        </Popconfirm>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-white px-4 py-4">
        {query.error && !query.data ? (
          <Alert type="error" showIcon title={getErrorMessage(query.error)} />
        ) : query.isPending ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : messages.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">{t("chats.thread.empty")}</div>
        ) : (
          messages.map((item, index) => {
            const day = dayjs(item.createdAt);
            const newDay = index === 0 || !day.isSame(messages[index - 1].createdAt, "day");
            return (
              <Fragment key={item.id}>
                {newDay && (
                  <div className="py-1 text-center text-xs text-slate-400">
                    {day.format("DD.MM.YYYY")}
                  </div>
                )}
                <MessageBubble message={item} />
              </Fragment>
            );
          })
        )}
        <div ref={bottom} />
      </div>

      <Composer chatId={chat.id} onSent={scrollDown} />
    </div>
  );
}
