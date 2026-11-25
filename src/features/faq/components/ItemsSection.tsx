import { SearchIcon } from "@/shared/icons";
import { App, Input, Select, Switch, Tag, type TableColumnsType } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { RecordsTable } from "@/shared/ui";
import {
  useDeleteFaqItem,
  useFaqItemsQuery,
  useReorderFaqItems,
  useSetFaqItemActive,
} from "../hooks/queries";
import { byLang, movedIds, plainText } from "../lib/display";
import {
  FAQ_CATEGORIES,
  FAQ_PAGE_KEYS,
  type FaqCategory,
  type FaqItem,
  type FaqPageKey,
} from "../model/types";
import { MoveButtons } from "./MoveButtons";

interface Props {
  /** the category chosen in the filter (the page opens a new question in it) */
  category: FaqCategory | undefined;
  onCategoryChange: (category: FaqCategory | undefined) => void;
  onOpen: (item: FaqItem) => void;
}

type Visibility = "visible" | "hidden";

/** The list of questions: filters, the order inside a category, the visibility switch. */
export function ItemsSection({ category, onCategoryChange, onOpen }: Props) {
  const { t, i18n } = useTranslation();
  const { message, modal } = App.useApp();

  const [search, setSearch] = useState("");
  const [pageKey, setPageKey] = useState<FaqPageKey>();
  const [visibility, setVisibility] = useState<Visibility>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const list = useFaqItemsQuery({
    filters: {
      search: useDebouncedValue(search, 300),
      category,
      pageKey,
      isActive: visibility && visibility === "visible",
    },
    page,
    pageSize,
  });
  const setActive = useSetFaqItemActive();
  const remove = useDeleteFaqItem();
  const reorder = useReorderFaqItems();

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  // the order is the order inside ONE category, and only the whole category can be reordered
  const canReorder =
    category !== undefined && !search && !pageKey && !visibility && items.length === total;

  const move = (index: number, step: -1 | 1) => {
    const ids = movedIds(
      items.map((item) => item.id),
      index,
      step,
    );
    if (ids) reorder.mutate(ids, { onError: (error) => message.error(getErrorMessage(error)) });
  };

  const confirmDelete = (item: FaqItem) =>
    modal.confirm({
      title: t("faq.deleteItemConfirm"),
      content: byLang(item.questionUz, item.questionRu, i18n.language),
      okText: t("common.delete"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () =>
        remove.mutateAsync(item.id).then(
          () => message.success(t("common.deleted")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  const resetPage = () => setPage(1);

  const columns: TableColumnsType<FaqItem> = [
    ...(canReorder
      ? [
          {
            key: "move",
            width: 84,
            render: (_: unknown, __: FaqItem, index: number) => (
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
      key: "question",
      title: t("faq.columns.question"),
      render: (_, item) => (
        <div className="min-w-0">
          <div className="font-bold">{byLang(item.questionUz, item.questionRu, i18n.language)}</div>
          <div className="line-clamp-1 text-xs text-slate-500">
            {plainText(byLang(item.answerUz, item.answerRu, i18n.language))}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      title: t("faq.columns.category"),
      width: 170,
      render: (_, item) => t(`faq.categories.${item.category}`),
    },
    {
      key: "pages",
      title: t("faq.columns.pages"),
      width: 220,
      render: (_, item) =>
        item.pageKeys.length ? (
          <span className="flex flex-wrap gap-1">
            {item.pageKeys.map((key) => (
              <Tag key={key} variant="filled" className="m-0">
                {t(`faq.pageKeys.${key}`)}
              </Tag>
            ))}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      key: "active",
      title: t("faq.columns.status"),
      width: 110,
      render: (_, item) => (
        // the switch must not open the question
        <span onClick={(event) => event.stopPropagation()}>
          <Switch
            checked={item.isActive}
            loading={setActive.isPending && setActive.variables?.id === item.id}
            onChange={(isActive) =>
              setActive.mutate(
                { id: item.id, isActive },
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
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          allowClear
          className="w-72"
          prefix={<SearchIcon className="text-slate-400" />}
          placeholder={t("faq.search")}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            resetPage();
          }}
        />
        <Select<FaqCategory>
          allowClear
          className="w-56"
          placeholder={t("faq.columns.category")}
          value={category}
          onChange={(value) => {
            onCategoryChange(value);
            resetPage();
          }}
          options={FAQ_CATEGORIES.map((key) => ({ value: key, label: t(`faq.categories.${key}`) }))}
        />
        <Select<FaqPageKey>
          allowClear
          className="w-56"
          placeholder={t("faq.columns.pages")}
          value={pageKey}
          onChange={(value) => {
            setPageKey(value);
            resetPage();
          }}
          options={FAQ_PAGE_KEYS.map((key) => ({ value: key, label: t(`faq.pageKeys.${key}`) }))}
        />
        <Select<Visibility>
          allowClear
          className="w-44"
          placeholder={t("faq.columns.status")}
          value={visibility}
          onChange={(value) => {
            setVisibility(value);
            resetPage();
          }}
          options={[
            { value: "visible", label: t("faq.visible") },
            { value: "hidden", label: t("faq.hidden") },
          ]}
        />
      </div>
      {category === undefined && (
        <p className="mt-0 mb-3 text-xs text-slate-500">{t("faq.reorderHint")}</p>
      )}

      <RecordsTable<FaqItem>
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
