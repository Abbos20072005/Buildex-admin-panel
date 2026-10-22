import { PlusIcon, SearchIcon } from "@/shared/icons";
import { Alert, Button, Empty, Input, Skeleton, Tabs } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  ChatList,
  ChatThread,
  NewChatModal,
  useChatQuery,
  useChatsQuery,
  useChatStatsQuery,
  type ChatFilter,
} from "@/features/chats";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { StatCard } from "@/shared/ui";

const FILTERS: ChatFilter[] = ["all", "unanswered", "guests"];
const PAGE_SIZE = 20;

const isFilter = (value: string | null): value is ChatFilter =>
  FILTERS.includes(value as ChatFilter);

/** Qo'llab-quvvatlash → Chat: customers' conversations with the support, and the answers. */
export function ChatsPage() {
  const { t } = useTranslation();
  // the opened chat and the tab live in the URL: "Bugungi ishlar" links to ?filter=unanswered
  const [params, setParams] = useSearchParams();
  const filterParam = params.get("filter");
  const filter: ChatFilter = isFilter(filterParam) ? filterParam : "all";
  const selectedId = Number(params.get("chat")) || null;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  const update = (next: { filter?: ChatFilter; chat?: number | null }) => {
    const copy = new URLSearchParams(params);
    if (next.filter !== undefined) {
      if (next.filter === "all") copy.delete("filter");
      else copy.set("filter", next.filter);
    }
    if (next.chat !== undefined) {
      if (next.chat === null) copy.delete("chat");
      else copy.set("chat", String(next.chat));
    }
    setParams(copy, { replace: true });
  };

  const stats = useChatStatsQuery();
  const list = useChatsQuery({
    filter,
    search: useDebouncedValue(search.trim(), 300) || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const opened = useChatQuery(selectedId);
  const chat =
    selectedId === null
      ? undefined
      : (opened.data ?? list.data?.items.find((item) => item.id === selectedId));

  const counts: Record<ChatFilter, number | undefined> = {
    all: stats.data?.total,
    unanswered: stats.data?.unanswered,
    guests: stats.data?.guests,
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.support")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">
            {t("nav.chat")}{" "}
            <span className="font-semibold text-slate-400">
              {counts.all === undefined ? "" : formatNumber(counts.all)}
            </span>
          </h1>
        </div>
        <Button type="primary" icon={<PlusIcon />} onClick={() => setCreating(true)}>
          {t("chats.newChat.button")}
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label={t("chats.stats.total")}
          value={stats.data?.total}
          note={t("chats.stats.totalNote")}
        />
        <StatCard
          label={t("chats.stats.unanswered")}
          value={stats.data?.unanswered}
          note={t("chats.stats.unansweredNote")}
          tone={stats.data?.unanswered ? "text-amber-700" : undefined}
        />
        <StatCard
          label={t("chats.stats.guests")}
          value={stats.data?.guests}
          note={t("chats.stats.guestsNote")}
        />
      </div>

      <div className="grid gap-4 lg:h-[calc(100vh-19rem)] lg:min-h-[480px] lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* on small screens one pane at a time: the list, or the opened chat */}
        <section
          className={clsx(
            "flex h-[70vh] min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:h-auto",
            selectedId !== null && "hidden lg:flex",
          )}
        >
          <div className="space-y-2 p-3 pb-0">
            <Input
              allowClear
              prefix={<SearchIcon className="text-slate-400" />}
              placeholder={t("chats.search")}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Tabs
              size="small"
              activeKey={filter}
              onChange={(key) => {
                update({ filter: key as ChatFilter });
                setPage(1);
              }}
              className="[&_.ant-tabs-nav]:mb-0"
              items={FILTERS.map((key) => ({
                key,
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    {t(`chats.tabs.${key}`)}
                    <span className="rounded-md bg-slate-100 px-1.5 text-xs leading-5 font-semibold text-slate-600">
                      {counts[key] === undefined ? "…" : formatNumber(counts[key])}
                    </span>
                  </span>
                ),
              }))}
            />
          </div>
          {list.error && !list.data ? (
            <div className="p-3">
              <Alert
                type="error"
                showIcon
                title={t("chats.loadError")}
                description={getErrorMessage(list.error)}
              />
            </div>
          ) : (
            <ChatList
              items={list.data?.items ?? []}
              total={list.data?.total ?? 0}
              loading={list.isPending}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              selectedId={selectedId}
              onSelect={(id) => update({ chat: id })}
            />
          )}
        </section>

        <section
          className={clsx(
            "flex h-[75vh] min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:h-auto",
            selectedId === null && "hidden lg:flex",
          )}
        >
          {chat ? (
            <ChatThread
              key={chat.id}
              chat={chat}
              onBack={() => update({ chat: null })}
              onDeleted={() => update({ chat: null })}
            />
          ) : selectedId !== null && opened.isPending ? (
            <div className="p-6">
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          ) : selectedId !== null && opened.error ? (
            <div className="p-6">
              <Alert type="error" showIcon title={getErrorMessage(opened.error)} />
            </div>
          ) : (
            <div className="grid flex-1 place-items-center">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("chats.selectChat")} />
            </div>
          )}
        </section>
      </div>

      {creating && (
        <NewChatModal
          onClose={() => setCreating(false)}
          onCreated={(id) => {
            setCreating(false);
            update({ filter: "all", chat: id });
          }}
        />
      )}
    </>
  );
}
