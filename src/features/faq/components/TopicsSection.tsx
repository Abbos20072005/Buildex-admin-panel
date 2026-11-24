import { App, Switch, type TableColumnsType } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { formatNumber } from "@/shared/lib/format";
import { RecordsTable } from "@/shared/ui";
import {
  useDeleteFaqTopic,
  useFaqTopicsQuery,
  useReorderFaqTopics,
  useSetFaqTopicActive,
} from "../hooks/queries";
import { byLang, movedIds } from "../lib/display";
import type { FaqTopic } from "../model/types";
import { MoveButtons } from "./MoveButtons";

interface Props {
  onOpen: (topic: FaqTopic) => void;
}

/** Page size that holds all the topics, so the whole list can be reordered at once. */
export const TOPICS_PAGE_SIZE = 100;

/** The list of topics: the order on the site, the visibility switch, the number of questions. */
export function TopicsSection({ onOpen }: Props) {
  const { t, i18n } = useTranslation();
  const { message, modal } = App.useApp();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(TOPICS_PAGE_SIZE);

  const list = useFaqTopicsQuery({ page, pageSize });
  const setActive = useSetFaqTopicActive();
  const remove = useDeleteFaqTopic();
  const reorder = useReorderFaqTopics();

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const canReorder = items.length === total;

  const move = (index: number, step: -1 | 1) => {
    const ids = movedIds(
      items.map((topic) => topic.id),
      index,
      step,
    );
    if (ids) reorder.mutate(ids, { onError: (error) => message.error(getErrorMessage(error)) });
  };

  const confirmDelete = (topic: FaqTopic) => {
    // the API refuses a topic with questions
    if (topic.itemsCount > 0) {
      message.warning(t("faq.topicHasItems", { count: topic.itemsCount }));
      return;
    }
    modal.confirm({
      title: t("faq.deleteTopicConfirm"),
      content: topic.name,
      okText: t("common.delete"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        remove.mutateAsync(topic.id).then(
          () => message.success(t("common.deleted")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });
  };

  const columns: TableColumnsType<FaqTopic> = [
    ...(canReorder
      ? [
          {
            key: "move",
            width: 84,
            render: (_: unknown, __: FaqTopic, index: number) => (
              <MoveButtons
                index={index}
                count={items.length}
                disabled={reorder.isPending}
                onMove={(step) => move(index, step)}
              />
            ),
          },
        ]
      : []),
    {
      key: "name",
      title: t("faq.columns.topic"),
      render: (_, topic) => (
        <div>
          <div className="font-bold">{byLang(topic.nameUz, topic.nameRu, i18n.language)}</div>
          <div className="font-mono text-xs text-slate-500">{topic.slug}</div>
        </div>
      ),
    },
    {
      key: "items",
      title: t("faq.columns.items"),
      width: 130,
      align: "right",
      render: (_, topic) => <span className="tabular-nums">{formatNumber(topic.itemsCount)}</span>,
    },
    {
      key: "active",
      title: t("faq.columns.status"),
      width: 110,
      render: (_, topic) => (
        // the switch must not open the topic
        <span onClick={(event) => event.stopPropagation()}>
          <Switch
            checked={topic.isActive}
            loading={setActive.isPending && setActive.variables?.id === topic.id}
            onChange={(isActive) =>
              setActive.mutate(
                { id: topic.id, isActive },
                { onError: (error) => message.error(getErrorMessage(error)) },
              )
            }
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <RecordsTable<FaqTopic>
        columns={columns}
        items={items}
        total={total}
        loading={list.isFetching}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        }}
        onOpen={onOpen}
        onDelete={confirmDelete}
      />
      {list.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("faq.loadError")}: {list.error.message}
        </p>
      )}
    </>
  );
}
