import { App, Button, Card, Empty, Input } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { formatDateTime } from "@/shared/lib/format";
import { useAddOrderComment } from "../../hooks/queries";
import type { OrderDetail } from "../../model/types";

/** Internal notes of the staff (the customer never sees them) + system notes of the backend. */
export function CommentsCard({ order }: { order: OrderDetail }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const addComment = useAddOrderComment();
  const [text, setText] = useState("");

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    addComment.mutate(
      { orderId: order.id, text: value },
      {
        onSuccess: () => setText(""),
        onError: (err) => message.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <Card
      title={t("orders.modal.notes")}
      extra={<span className="text-xs text-slate-500">{t("orders.modal.notesHidden")}</span>}
    >
      {order.comments.length > 0 ? (
        <ul className="m-0 mb-4 flex max-h-80 list-none flex-col gap-3 overflow-y-auto p-0">
          {order.comments.map((comment) => (
            <li key={comment.id}>
              <div className="mb-1 flex items-baseline gap-2 text-xs">
                <b>{comment.isSystem ? t("orders.modal.system") : (comment.author ?? "—")}</b>
                <span className="text-slate-400">{formatDateTime(comment.createdAt)}</span>
              </div>
              <div
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  comment.isSystem ? "bg-slate-100 text-slate-700" : "bg-blue-50 text-slate-800",
                )}
              >
                {comment.text}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("orders.modal.noNotes")}
          className="mt-0 mb-3"
        />
      )}

      <Input.TextArea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t("orders.modal.notePlaceholder")}
        autoSize={{ minRows: 2, maxRows: 6 }}
        disabled={addComment.isPending}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) submit();
        }}
      />
      <div className="mt-2 flex justify-end">
        <Button loading={addComment.isPending} disabled={!text.trim()} onClick={submit}>
          {t("orders.modal.addNote")}
        </Button>
      </div>
    </Card>
  );
}
