import { App, Button, Segmented } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BlockEditor,
  BlocksCard,
  HomePreview,
  RulesCard,
  useHomeBlocksQuery,
  useHomePageQuery,
  usePublishHome,
  type BlockDraft,
  type BlockType,
  type Channel,
  type HomeBlock,
} from "@/features/home";
import { getErrorMessage } from "@/shared/api";

/** The open editor: a block being edited, or a new block of a chosen type. */
type Editing = { block: HomeBlock; type: BlockType } | { block: null; type: BlockType } | null;

/** Kontentlar → Bosh sahifa: the blocks of the home page, the display rules and publishing. */
export function HomePage() {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const [channel, setChannel] = useState<Channel>("site");
  const [editing, setEditing] = useState<Editing>(null);
  /** the open editor's unsaved edits, drawn in the preview */
  const [draft, setDraft] = useState<BlockDraft | null>(null);

  const blocks = useHomeBlocksQuery(channel);
  const page = useHomePageQuery();
  const publish = usePublishHome();

  const state = page.data;

  const confirmPublish = () =>
    modal.confirm({
      title: t("home.publishConfirm"),
      content: t("home.publishHint"),
      okText: t("home.publish"),
      cancelText: t("common.cancel"),
      onOk: () =>
        publish.mutateAsync().then(
          () => message.success(t("home.published")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.contents")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">{t("nav.homePage")}</h1>
          <div className="mt-1 text-xs text-slate-500">
            {state?.publishedAt
              ? t("home.lastPublished", {
                  date: dayjs(state.publishedAt).format("DD.MM.YYYY HH:mm"),
                  name: state.publishedBy?.fullName ?? "—",
                })
              : t("home.neverPublished")}
          </div>
        </div>
        <Button
          type="primary"
          disabled={!state?.hasChanges}
          loading={publish.isPending}
          onClick={confirmPublish}
        >
          {t("home.publish")}
        </Button>
      </div>

      <Segmented<Channel>
        className="mb-4"
        value={channel}
        onChange={setChannel}
        options={[
          { value: "site", label: t("home.channels.site") },
          { value: "app", label: t("home.tabApp") },
        ]}
      />

      {/* Mobil ilova: the phone stands beside the list. Sayt: the laptop is wide, so it sits below */}
      <div
        className={
          channel === "app"
            ? "grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]"
            : "flex flex-col gap-4"
        }
      >
        <div className="flex min-w-0 flex-col gap-4">
          <BlocksCard
            channel={channel}
            blocks={blocks.data ?? []}
            loading={blocks.isPending}
            onEdit={(block) => setEditing({ block, type: block.type })}
            onAdd={(type) => setEditing({ block: null, type })}
          />
          {blocks.error && (
            <p className="m-0 text-sm text-red-600">
              {t("home.loadError")}: {getErrorMessage(blocks.error)}
            </p>
          )}
          <RulesCard page={state} />
        </div>
        <HomePreview channel={channel} blocks={blocks.data ?? []} draft={draft} />
      </div>

      {editing && (
        <BlockEditor
          key={editing.block?.id ?? `new-${editing.type}`}
          block={editing.block}
          type={editing.type}
          onClose={() => setEditing(null)}
          onDraft={setDraft}
        />
      )}
    </>
  );
}
