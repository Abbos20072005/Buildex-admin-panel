import { Table, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCustomerChatsQuery, type Chat } from "@/features/chats";
import { formatDateTime } from "@/shared/lib/format";

const soon = (label: string) => <span className="text-xs text-slate-400">{label}</span>;

/**
 * The customer's requests. The design is a table of tickets (№ · Mavzu · Kanal · Buyurtma · Holat ·
 * Mas'ul · Ochilgan); the backend has no tickets yet, so the chats fill what they can (№, Mavzu =
 * the last message, Holat, Ochilgan) and the other columns wait. A click opens the chat.
 */
export function RequestsTab({ customerId }: { customerId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const chats = useCustomerChatsQuery(customerId);
  const waiting = soon(t("customers.soonShort"));

  return (
    <>
      <p className="mt-0 mb-3 text-xs text-slate-500">{t("customers.requests.soon")}</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table<Chat>
          rowKey="id"
          size="middle"
          loading={chats.isPending}
          dataSource={chats.data?.items ?? []}
          pagination={false}
          scroll={{ x: 900 }}
          locale={{ emptyText: <div className="py-10 text-slate-500">{t("common.noData")}</div> }}
          onRow={(chat) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`/support/chat?chat=${chat.id}`),
          })}
          columns={[
            {
              key: "id",
              title: t("customers.requests.number"),
              width: 110,
              render: (_, chat) => (
                <span className="font-mono font-semibold">
                  MR-{String(chat.id).padStart(4, "0")}
                </span>
              ),
            },
            {
              key: "subject",
              title: t("customers.requests.subject"),
              render: (_, chat) => (
                <span className="line-clamp-1">
                  {chat.lastMessage?.text || (chat.lastMessage?.image ? "🖼" : "—")}
                </span>
              ),
            },
            {
              key: "channel",
              title: t("customers.requests.channel"),
              width: 110,
              render: () => waiting,
            },
            {
              key: "order",
              title: t("customers.requests.order"),
              width: 110,
              render: () => waiting,
            },
            {
              key: "state",
              title: t("customers.requests.state"),
              width: 140,
              render: (_, chat) =>
                chat.lastMessage && !chat.lastMessage.isAnswer ? (
                  <Tag color="gold" variant="filled" className="m-0">
                    {t("customers.requests.waiting")}
                  </Tag>
                ) : (
                  <Tag color="green" variant="filled" className="m-0">
                    {t("customers.requests.answered")}
                  </Tag>
                ),
            },
            {
              key: "assignee",
              title: t("customers.requests.assignee"),
              width: 130,
              render: () => waiting,
            },
            {
              key: "created",
              title: t("customers.requests.opened"),
              width: 160,
              render: (_, chat) => formatDateTime(chat.createdAt),
            },
          ]}
        />
      </div>
    </>
  );
}
