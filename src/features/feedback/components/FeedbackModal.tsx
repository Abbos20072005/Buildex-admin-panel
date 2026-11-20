import { TrashIcon } from "@/shared/icons";
import { App, Button, Image, Modal, Popconfirm, Skeleton, Switch, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getErrorMessage } from "@/shared/api";
import { formatDateTime, formatPhone } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import {
  useFeedbackQuery,
  useRemoveFeedbackMutation,
  useReplyMutation,
  useSetVisibleMutation,
} from "../hooks/queries";
import { authorTitle } from "../lib/display";
import type { FeedbackItem } from "../model/types";
import { ReplyBox } from "./ReplyBox";
import { ReplyBubble } from "./ReplyBubble";
import { Stars } from "./Stars";

interface Props {
  /** the row of the table: shown at once, while the answers are loading */
  item: FeedbackItem;
  onClose: () => void;
}

/**
 * A review or a question opened from the table: who wrote it and about which product, the text
 * and the pictures, the thread of answers and the box for the shop's answer; the footer shows it
 * on the site or hides it, and deletes it.
 */
export function FeedbackModal({ item: row, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { kind } = row;
  const query = useFeedbackQuery(kind, row.id);
  const item = query.data ?? row;
  const replies = item.replies;

  const reply = useReplyMutation(kind);
  const setVisible = useSetVisibleMutation(kind);
  const remove = useRemoveFeedbackMutation(kind);

  const submit = (text: string) =>
    reply.mutateAsync({ itemId: item.id, text }).then(
      () => message.success(t("feedback.toast.replySent")),
      (error: unknown) => {
        message.error(getErrorMessage(error));
        throw error;
      },
    );

  const toggleVisible = (isVisible: boolean) =>
    setVisible.mutate(
      { id: item.id, isVisible },
      {
        onSuccess: () =>
          message.success(t(isVisible ? "feedback.toast.shown" : "feedback.toast.hidden")),
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );

  const handleDelete = () =>
    remove.mutate(item.id, {
      onSuccess: () => {
        message.success(t("feedback.toast.deleted"));
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });

  const name = authorTitle(item.customer, t);

  return (
    <Modal
      open
      centered
      width={720}
      onCancel={onClose}
      title={t(kind === "reviews" ? "feedback.modal.reviews" : "feedback.modal.questions")}
      styles={{ body: { padding: 0 } }}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={item.isVisible}
              loading={setVisible.isPending}
              onChange={toggleVisible}
            />
            {t("feedback.visible")}
          </label>
          <div className="flex gap-2">
            <Popconfirm
              title={t(`feedback.delete.${kind}`)}
              description={t("feedback.delete.hint")}
              okText={t("common.delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("common.cancel")}
              onConfirm={handleDelete}
            >
              <Button danger icon={<TrashIcon />} loading={remove.isPending}>
                {t("common.delete")}
              </Button>
            </Popconfirm>
            <Button onClick={onClose}>{t("common.close")}</Button>
          </div>
        </div>
      }
    >
      <div className="max-h-[calc(100vh-18rem)] space-y-4 overflow-y-auto p-5">
        <div className="flex items-start gap-3">
          <InitialsAvatar name={name} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {item.customer ? (
                <Link
                  to={`/customers/${item.customer.id}`}
                  className="font-bold text-slate-900 hover:text-brand"
                >
                  {name}
                </Link>
              ) : (
                <span className="font-bold">{name}</span>
              )}
              {!item.isVisible && (
                <Tag variant="filled" className="m-0">
                  {t("feedback.status.hidden")}
                </Tag>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {item.customer?.phone && (
                <span className="font-mono">{formatPhone(item.customer.phone)} · </span>
              )}
              {formatDateTime(item.createdAt)}
            </div>
          </div>
          {item.rating !== null && <Stars value={item.rating} />}
        </div>

        {item.product && (
          <Link
            to={`/products/${item.product.id}`}
            className="block rounded-lg bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100"
          >
            <span className="text-slate-500">{t("feedback.product")}: </span>
            <span className="font-semibold text-slate-900">{item.product.name}</span>
            {item.product.code && (
              <span className="ml-2 font-mono text-xs text-slate-500">{item.product.code}</span>
            )}
          </Link>
        )}

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-sm break-words whitespace-pre-wrap">{item.text || "—"}</div>
          {item.images.length > 0 && (
            <Image.PreviewGroup>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.images.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                    alt=""
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          )}
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold text-slate-600">
            {t("feedback.replies")}
            {replies ? ` (${replies.length})` : ""}
          </div>
          {replies === null ? (
            query.isError ? (
              <div className="text-sm text-red-600">{getErrorMessage(query.error)}</div>
            ) : (
              <Skeleton active paragraph={{ rows: 2 }} title={false} />
            )
          ) : replies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
              {t("feedback.noReplies")}
            </div>
          ) : (
            <div className="space-y-2.5">
              {replies.map((entry) => (
                <ReplyBubble key={entry.id} kind={kind} reply={entry} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ReplyBox loading={reply.isPending} onSubmit={submit} />
    </Modal>
  );
}
