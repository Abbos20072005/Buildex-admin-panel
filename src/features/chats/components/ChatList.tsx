import { ImageIcon } from "@/shared/icons";
import { Empty, Skeleton, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { InitialsAvatar } from "@/shared/ui";
import { useUnansweredStreakQuery } from "../hooks/queries";
import { chatTime, chatTitle } from "../lib/display";
import { isWaiting, unreadCount, useSeen } from "../lib/seen";
import type { Chat } from "../model/types";
import { Tick } from "./MessageStatus";

interface Props {
  items: Chat[];
  loading: boolean;
  /** more chats can be loaded: they come when the list is scrolled to its end */
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function Preview({ chat }: { chat: Chat }) {
  const { t } = useTranslation();
  const last = chat.lastMessage;
  if (!last) return <span className="italic">{t("chats.noMessages")}</span>;
  return (
    <>
      {last.isAnswer && <Tick className="mr-1 inline-block align-text-bottom text-brand" />}
      {last.text ||
        (last.image && (
          <span className="inline-flex items-center gap-1">
            <ImageIcon /> {t("chats.photo")}
          </span>
        ))}
    </>
  );
}

interface RowProps {
  chat: Chat;
  selected: boolean;
  onSelect: (id: number) => void;
}

function ChatRow({ chat, selected, onSelect }: RowProps) {
  const { t } = useTranslation();
  const seen = useSeen();
  // a chat never opened here: how many messages are waiting is read from the chat itself
  const unknown = seen[chat.id] === undefined && isWaiting(chat);
  const streak = useUnansweredStreakQuery(chat.id, chat.messagesCount, unknown);
  const unread = unreadCount(chat, seen, streak.data);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(chat.id)}
        className={clsx(
          "flex w-full cursor-pointer items-center gap-3 border-0 border-b border-solid border-slate-100 px-4 py-3 text-left",
          selected ? "bg-brand-soft" : "bg-transparent hover:bg-slate-50",
        )}
      >
        <InitialsAvatar name={chatTitle(chat, t)} size={40} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className={clsx("truncate text-sm", unread > 0 ? "font-bold" : "font-semibold")}>
              {chatTitle(chat, t)}
            </span>
            <span className="shrink-0 text-xs text-slate-400 tabular-nums">
              {chatTime(chat.lastMessage?.createdAt ?? chat.createdAt)}
            </span>
          </span>
          <span className="flex items-center justify-between gap-2">
            <span
              className={clsx(
                "truncate text-xs",
                unread > 0 ? "font-semibold text-slate-700" : "text-slate-500",
              )}
            >
              <Preview chat={chat} />
            </span>
            {unread > 0 && (
              // the blue number of Telegram: the customer's messages not opened yet;
              // it goes away once the chat has been opened
              <span
                title={t("chats.unread", { count: unread })}
                className="min-w-5 shrink-0 rounded-full bg-brand px-1.5 text-center text-xs leading-5 font-bold text-white tabular-nums"
              >
                {unread}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

/** Chats, the newest activity first; a chat with new customer messages shows their number. */
export function ChatList({
  items,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  selectedId,
  onSelect,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const node = event.currentTarget;
          if (
            hasMore &&
            !loadingMore &&
            node.scrollHeight - node.scrollTop - node.clientHeight < 240
          )
            onLoadMore();
        }}
      >
        {loading && items.length === 0 ? (
          <div className="p-4">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : items.length === 0 ? (
          <Empty
            className="py-10"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("chats.emptyList")}
          />
        ) : (
          <ul className="m-0 list-none p-0">
            {items.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                selected={chat.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>
      {loadingMore && (
        <div className="border-t border-slate-100 py-2 text-center">
          <Spin size="small" />
        </div>
      )}
    </div>
  );
}
