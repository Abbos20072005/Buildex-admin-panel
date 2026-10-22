import { ImageIcon } from "@/shared/icons";
import { Empty, Pagination, Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { maskPhone } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import { chatTime, chatTitle } from "../lib/display";
import type { Chat } from "../model/types";

interface Props {
  items: Chat[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function Preview({ chat }: { chat: Chat }) {
  const { t } = useTranslation();
  const last = chat.lastMessage;
  if (!last) return <span className="italic">{t("chats.noMessages")}</span>;
  return (
    <>
      {last.isAnswer && <span className="text-slate-400">{t("chats.you")}: </span>}
      {last.text ||
        (last.image && (
          <span className="inline-flex items-center gap-1">
            <ImageIcon /> {t("chats.photo")}
          </span>
        ))}
    </>
  );
}

/** Chats, the newest activity first; a chat whose last message is the customer's is marked. */
export function ChatList({
  items,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  selectedId,
  onSelect,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
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
            {items.map((chat) => {
              const waiting = chat.lastMessage !== null && !chat.lastMessage.isAnswer;
              const selected = chat.id === selectedId;
              return (
                <li key={chat.id}>
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
                        <span
                          className={clsx(
                            "truncate text-sm",
                            waiting ? "font-bold" : "font-semibold",
                          )}
                        >
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
                            waiting ? "font-semibold text-slate-700" : "text-slate-500",
                          )}
                        >
                          <Preview chat={chat} />
                        </span>
                        {waiting && (
                          <span
                            title={t("chats.waiting")}
                            className="size-2 shrink-0 rounded-full bg-amber-500"
                          />
                        )}
                      </span>
                      {chat.customer?.phone && (
                        <span className="block font-mono text-[11px] text-slate-400">
                          {maskPhone(chat.customer.phone)}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {total > pageSize && (
        <div className="border-t border-slate-100 p-3">
          <Pagination
            size="small"
            simple
            align="center"
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
