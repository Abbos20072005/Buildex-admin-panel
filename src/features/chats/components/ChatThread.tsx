import { Alert, App, Button, Popconfirm, Skeleton, Tag } from "antd";
import dayjs from "dayjs";
import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { formatPhone } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import { useChatMessagesQuery, useRemoveChat, useReply } from "../hooks/queries";
import { chatTitle, dayLabel } from "../lib/display";
import { markSeen, useSeen } from "../lib/seen";
import type { Chat } from "../model/types";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";
import { PendingBubble, type PendingReply } from "./PendingBubble";

interface Props {
  chat: Chat;
  /** small screens: back to the list */
  onBack: () => void;
  onDeleted: () => void;
}

/** Messages closer than this, from the same side, are drawn as one group. */
const GROUP_MS = 5 * 60 * 1000;

/**
 * One conversation, like a messenger: the messages oldest first, day labels, a "new messages"
 * line, answers shown at once with a clock until the server has them, and the reply box.
 */
export function ChatThread({ chat, onBack, onDeleted }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const query = useChatMessagesQuery(chat.id);
  const remove = useRemoveChat();
  const reply = useReply();
  const messages = query.data ?? [];

  const [pending, setPending] = useState<PendingReply[]>([]);
  const nextKey = useRef(0);

  const scroller = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const [showDown, setShowDown] = useState(false);
  const lastId = messages.at(-1)?.id;

  // how many messages this browser had seen before opening the chat: the "new messages" line
  const seen = useSeen();
  const [seenAtOpen] = useState(() => seen[chat.id]);
  const total = Math.max(messages.length, chat.messagesCount);
  useEffect(() => {
    if (query.data) markSeen(chat.id, total);
  }, [chat.id, total, query.data]);

  const scrollDown = (behavior: ScrollBehavior = "auto") => {
    const node = scroller.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior });
  };

  // a new message scrolls the thread down only when it was already at the bottom
  useEffect(() => {
    if (atBottom.current) scrollDown();
  }, [lastId, pending.length]);

  const onScroll = () => {
    const node = scroller.current;
    if (!node) return;
    atBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
    setShowDown(!atBottom.current);
  };

  const dispatch = (item: PendingReply) => {
    setPending((list) =>
      list.map((entry) => (entry.key === item.key ? { ...entry, failed: false } : entry)),
    );
    reply
      .mutateAsync({ chatId: chat.id, text: item.text, image: item.image })
      // the thread is reloaded before the clock disappears, so the answer never blinks out
      .then(() => setPending((list) => list.filter((entry) => entry.key !== item.key)))
      .catch((error: unknown) => {
        setPending((list) =>
          list.map((entry) => (entry.key === item.key ? { ...entry, failed: true } : entry)),
        );
        message.error(getErrorMessage(error));
      });
  };

  const submit = (text: string, image?: File) => {
    const item: PendingReply = { key: (nextKey.current += 1), text, image, failed: false };
    setPending((list) => [...list, item]);
    atBottom.current = true;
    dispatch(item);
  };

  const handleDelete = () =>
    remove.mutate(chat.id, {
      onSuccess: () => {
        message.success(t("chats.toast.chatDeleted"));
        onDeleted();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });

  // index of the first message that was not seen before (only the customer's count)
  const firstUnseen =
    seenAtOpen === undefined ? -1 : seenAtOpen - Math.max(0, chat.messagesCount - messages.length);
  const dividerAt =
    firstUnseen >= 0 && firstUnseen < messages.length && !messages[firstUnseen].isAnswer
      ? firstUnseen
      : -1;

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
            {t("chats.thread.count", { count: total })}
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

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto bg-surface px-4 py-3 [&::-webkit-scrollbar]:hidden"
        >
          {query.error && !query.data ? (
            <Alert type="error" showIcon title={getErrorMessage(query.error)} />
          ) : query.isPending ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : messages.length === 0 && pending.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              {t("chats.thread.empty")}
            </div>
          ) : (
            <>
              {messages.map((item, index) => {
                const previous = messages[index - 1];
                const newDay =
                  !previous || !dayjs(item.createdAt).isSame(previous.createdAt, "day");
                const grouped =
                  !newDay &&
                  previous.isAnswer === item.isAnswer &&
                  dayjs(item.createdAt).diff(previous.createdAt) < GROUP_MS;
                return (
                  <Fragment key={item.id}>
                    {newDay && (
                      <div className="mt-3 flex justify-center">
                        <span className="rounded-full bg-white px-3 py-0.5 text-xs text-slate-500 shadow-sm">
                          {dayLabel(item.createdAt, t)}
                        </span>
                      </div>
                    )}
                    {index === dividerAt && (
                      <div className="my-3 flex items-center gap-3 text-xs font-semibold text-brand">
                        <span className="h-px flex-1 bg-brand/30" />
                        {t("chats.newMessages")}
                        <span className="h-px flex-1 bg-brand/30" />
                      </div>
                    )}
                    <MessageBubble message={item} grouped={grouped} />
                  </Fragment>
                );
              })}
              {pending.map((item, index) => (
                <PendingBubble
                  key={item.key}
                  reply={item}
                  grouped={index > 0 || messages.at(-1)?.isAnswer === true}
                  onRetry={() => dispatch(item)}
                  onRemove={() =>
                    setPending((list) => list.filter((entry) => entry.key !== item.key))
                  }
                />
              ))}
            </>
          )}
        </div>
        {showDown && (
          <Button
            shape="circle"
            className="absolute right-4 bottom-4 shadow-md"
            aria-label={t("chats.scrollDown")}
            onClick={() => scrollDown("smooth")}
          >
            ↓
          </Button>
        )}
      </div>

      <Composer onSubmit={submit} />
    </div>
  );
}
