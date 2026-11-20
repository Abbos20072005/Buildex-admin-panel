import { CommentIcon, SearchIcon, TrashIcon } from "@/shared/icons";
import { Alert, App, Input, Segmented, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { getErrorMessage } from "@/shared/api";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { RecordsTable, type RowMenuItem } from "@/shared/ui";
import {
  useFeedbackListQuery,
  useFeedbackStatsQuery,
  useRemoveFeedbackMutation,
  useSetVisibleMutation,
} from "../hooks/queries";
import type { FeedbackFilter, FeedbackItem, FeedbackKind } from "../model/types";
import { feedbackColumns } from "./columns";
import { FeedbackModal } from "./FeedbackModal";
import { Stars } from "./Stars";

const FILTERS: FeedbackFilter[] = ["all", "unanswered", "answered", "hidden"];
const RATINGS = [5, 4, 3, 2, 1];

const isFilter = (value: string | null): value is FeedbackFilter =>
  FILTERS.includes(value as FeedbackFilter);

interface Props {
  kind: FeedbackKind;
}

/**
 * Qo'llab-quvvatlash → Sharhlar / Savollar: what customers wrote under the products, as a table.
 * A click on a row opens it in a window, where the shop answers.
 */
export function FeedbackBoard({ kind }: Props) {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  // the tab and the rating live in the URL: a link (the sidebar counter…) opens the right list
  const [params, setParams] = useSearchParams();
  const filterParam = params.get("filter");
  const filter: FeedbackFilter = isFilter(filterParam) ? filterParam : "all";
  const rating = Number(params.get("rating")) || undefined;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  const update = (next: { filter?: FeedbackFilter; rating?: number | null }) => {
    const copy = new URLSearchParams(params);
    if (next.filter !== undefined) {
      if (next.filter === "all") copy.delete("filter");
      else copy.set("filter", next.filter);
    }
    if (next.rating !== undefined) {
      if (next.rating === null) copy.delete("rating");
      else copy.set("rating", String(next.rating));
    }
    setParams(copy, { replace: true });
    setPage(1);
  };

  const stats = useFeedbackStatsQuery(kind);
  const list = useFeedbackListQuery(kind, {
    filter,
    rating: kind === "reviews" ? rating : undefined,
    search: useDebouncedValue(search.trim(), 300) || undefined,
    page,
    pageSize,
  });
  const setVisible = useSetVisibleMutation(kind);
  const remove = useRemoveFeedbackMutation(kind);

  const counts: Record<FeedbackFilter, number | undefined> = {
    all: stats.data?.total,
    unanswered: stats.data?.unanswered,
    answered: stats.data ? stats.data.total - stats.data.unanswered : undefined,
    hidden: stats.data?.hidden,
  };

  const rowMenu = (item: FeedbackItem): RowMenuItem[] => [
    { key: "open", icon: <CommentIcon />, label: t("feedback.actions.reply") },
    {
      key: "toggle",
      label: t(item.isVisible ? "feedback.actions.hide" : "feedback.actions.show"),
    },
    {
      key: "delete",
      icon: <TrashIcon />,
      label: t("common.delete"),
      danger: true,
      separated: true,
    },
  ];

  const confirmDelete = (item: FeedbackItem) =>
    modal.confirm({
      title: t(`feedback.delete.${kind}`),
      content: t("feedback.delete.hint"),
      okText: t("common.delete"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        remove.mutateAsync(item.id).then(
          () => message.success(t("feedback.toast.deleted")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  const onMenuAction = (key: string, item: FeedbackItem) => {
    if (key === "open") setSelected(item);
    else if (key === "delete") confirmDelete(item);
    else
      setVisible.mutate(
        { id: item.id, isVisible: !item.isVisible },
        {
          onSuccess: () =>
            message.success(t(item.isVisible ? "feedback.toast.hidden" : "feedback.toast.shown")),
          onError: (error) => message.error(getErrorMessage(error)),
        },
      );
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.support")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">
            {t(kind === "reviews" ? "nav.reviews" : "nav.questions")}{" "}
            <span className="font-semibold text-slate-400">
              {counts.all === undefined ? "" : formatNumber(counts.all)}
            </span>
          </h1>
        </div>
        {kind === "reviews" && stats.data?.averageRating != null && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2">
            <span className="text-2xl leading-none font-extrabold tabular-nums">
              {stats.data.averageRating.toFixed(1)}
            </span>
            <div>
              <Stars value={stats.data.averageRating} />
              <div className="text-xs text-slate-500">{t("feedback.averageRating")}</div>
            </div>
          </div>
        )}
      </div>

      <RecordsTable<FeedbackItem>
        toolbarClassName="flex flex-wrap items-center gap-3 p-4"
        toolbar={
          <>
            <Segmented<FeedbackFilter>
              value={filter}
              onChange={(value) => update({ filter: value })}
              options={FILTERS.map((key) => ({
                value: key,
                label: `${t(`feedback.tabs.${key}`)}${
                  counts[key] === undefined ? "" : ` (${formatNumber(counts[key])})`
                }`,
              }))}
            />
            <Input
              allowClear
              className="ml-auto w-72"
              prefix={<SearchIcon className="text-slate-400" />}
              placeholder={t(`feedback.search.${kind}`)}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            {kind === "reviews" && (
              <Select
                allowClear
                className="w-32"
                placeholder={t("feedback.rating.placeholder")}
                value={rating}
                onChange={(value: number | undefined) => update({ rating: value ?? null })}
                options={RATINGS.map((value) => ({ value, label: <Stars value={value} /> }))}
              />
            )}
          </>
        }
        columns={feedbackColumns(t, kind, (page - 1) * pageSize)}
        items={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        loading={list.isFetching}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        }}
        onOpen={setSelected}
        rowMenu={rowMenu}
        onMenuAction={onMenuAction}
      />
      {list.error && (
        <Alert
          className="mt-3"
          type="error"
          showIcon
          title={t("feedback.loadError")}
          description={getErrorMessage(list.error)}
        />
      )}

      {selected !== null && (
        <FeedbackModal key={selected.id} item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
