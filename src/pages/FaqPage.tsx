import { PlusIcon } from "@/shared/icons";
import { Button, Segmented } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ItemEditor,
  ItemsSection,
  TOPICS_PAGE_SIZE,
  TopicEditor,
  TopicsSection,
  useFaqTopicsQuery,
  type FaqItem,
  type FaqTopic,
} from "@/features/faq";

type Tab = "items" | "topics";

/** "Savol-javoblar": the questions of the site and the app, grouped by topics. */
export function FaqPage() {
  const { t } = useTranslation();

  const [tab, setTab] = useState<Tab>("items");
  /** the topic chosen in the questions' filter — a new question starts in it */
  const [topicId, setTopicId] = useState<number>();
  /** an object — that record is edited; "new" — the create form; null — closed */
  const [item, setItem] = useState<FaqItem | "new" | null>(null);
  const [topic, setTopic] = useState<FaqTopic | "new" | null>(null);

  // the same query as the topics tab: one request feeds both lists and the question form
  const topics = useFaqTopicsQuery({ page: 1, pageSize: TOPICS_PAGE_SIZE });
  const topicList = topics.data?.items ?? [];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.contents")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.faq")}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={<PlusIcon />}
            onClick={() => {
              setTab("topics");
              setTopic("new");
            }}
          >
            {t("faq.addTopic")}
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setTab("items");
              setItem("new");
            }}
          >
            {t("faq.addItem")}
          </Button>
        </div>
      </div>

      <Segmented<Tab>
        className="mb-4"
        value={tab}
        onChange={setTab}
        options={[
          { value: "items", label: t("faq.tabItems") },
          { value: "topics", label: t("faq.tabTopics") },
        ]}
      />

      {tab === "items" ? (
        <ItemsSection
          topics={topicList}
          topicId={topicId}
          onTopicChange={setTopicId}
          onOpen={setItem}
        />
      ) : (
        <TopicsSection onOpen={setTopic} />
      )}

      {item !== null && (
        <ItemEditor
          key={item === "new" ? "new" : item.id}
          item={item === "new" ? null : item}
          topics={topicList}
          defaultTopicId={topicId}
          onClose={() => setItem(null)}
        />
      )}
      {topic !== null && (
        <TopicEditor
          key={topic === "new" ? "new" : topic.id}
          topic={topic === "new" ? null : topic}
          onClose={() => setTopic(null)}
        />
      )}
    </>
  );
}
