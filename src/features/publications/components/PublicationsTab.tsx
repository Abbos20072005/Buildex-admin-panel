import { useTranslation } from "react-i18next";
import { articleHooks, newsHooks, videoHooks } from "../hooks/queries";
import type { PublicationKind } from "../model/types";
import { ArticleEditor } from "./ArticleEditor";
import { articleColumns, newsColumns, videoColumns } from "./columns";
import { NewsEditor } from "./NewsEditor";
import { PublicationsSection } from "./PublicationsSection";
import { VideoEditor } from "./VideoEditor";

/** The tab of the "Yangiliklar" page for one kind of publication. */
export function PublicationsTab({ kind }: { kind: PublicationKind }) {
  const { t } = useTranslation();

  switch (kind) {
    case "news":
      return (
        <PublicationsSection
          kind="news"
          useList={newsHooks.useList}
          useRemove={newsHooks.useRemove}
          columns={newsColumns(t)}
          nameOf={(item) => item.name}
          renderEditor={(id, onClose) => <NewsEditor key={id} id={id} onClose={onClose} />}
        />
      );
    case "articles":
      return (
        <PublicationsSection
          kind="articles"
          useList={articleHooks.useList}
          useRemove={articleHooks.useRemove}
          columns={articleColumns(t)}
          nameOf={(item) => item.title}
          renderEditor={(id, onClose) => <ArticleEditor key={id} id={id} onClose={onClose} />}
        />
      );
    case "videos":
      return (
        <PublicationsSection
          kind="videos"
          useList={videoHooks.useList}
          useRemove={videoHooks.useRemove}
          columns={videoColumns(t)}
          nameOf={(item) => item.name}
          renderEditor={(id, onClose) => <VideoEditor key={id} id={id} onClose={onClose} />}
        />
      );
  }
}
