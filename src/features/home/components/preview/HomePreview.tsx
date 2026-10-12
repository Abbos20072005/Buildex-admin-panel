import { Card } from "antd";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { buildPreviewBlocks } from "../../lib/previewModel";
import type { BlockDraft, Device } from "../../model/preview";
import type { Channel, HomeBlock } from "../../model/types";
import { PreviewBlockView } from "./PreviewBlockView";

interface Props {
  channel: Channel;
  blocks: HomeBlock[];
  /** the open editor's unsaved edits; null when no editor is open */
  draft: BlockDraft | null;
}

/** A phone: rounded dark frame, status line, search bar. */
function Phone({ children, search }: { children: ReactNode; search: string }) {
  return (
    <div className="mx-auto w-[300px] overflow-hidden rounded-[28px] border-[6px] border-slate-900 bg-white">
      <div className="flex items-center justify-between px-4 pt-2 text-[10px] font-semibold">
        <span>09:41</span>
        <span>buildex</span>
      </div>
      <div className="px-3 pt-2">
        <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] text-slate-400">
          {search}
        </div>
      </div>
      <div className="max-h-[560px] space-y-2 overflow-y-auto px-2 py-3">{children}</div>
    </div>
  );
}

/** A laptop: the screen with a browser bar, and the keyboard base under it. */
function Laptop({ children, search }: { children: ReactNode; search: string }) {
  return (
    <div className="mx-auto w-full max-w-[960px]">
      <div className="rounded-t-2xl border-[8px] border-b-0 border-slate-900 bg-slate-900">
        <div className="overflow-hidden rounded-t-md bg-white">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-1.5">
            <span className="size-2 rounded-full bg-red-300" />
            <span className="size-2 rounded-full bg-amber-300" />
            <span className="size-2 rounded-full bg-green-300" />
            <span className="ml-2 flex-1 rounded bg-white px-2 py-0.5 text-[10px] text-slate-500">
              buildex.uz
            </span>
          </div>
          <div className="border-b border-slate-100 px-4 py-2">
            <div className="max-w-md rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] text-slate-400">
              {search}
            </div>
          </div>
          <div className="h-[460px] space-y-2 overflow-y-auto px-4 py-3">{children}</div>
        </div>
      </div>
      {/* the base: wider than the screen, with the thumb notch */}
      <div className="relative mx-[-3%] h-3.5 rounded-b-2xl bg-gradient-to-b from-slate-300 to-slate-400">
        <span className="absolute top-0 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-b-lg bg-slate-500/60" />
      </div>
    </div>
  );
}

/**
 * The page as customers would get it: a phone for the Mobil ilova tab, a laptop for the Sayt
 * tab. Real banners, categories and products are drawn; an open block editor's edits show
 * immediately, before they are saved. Hidden blocks are dimmed and say why.
 */
export function HomePreview({ channel, blocks, draft }: Props) {
  const { t } = useTranslation();
  const device: Device = channel === "site" ? "desktop" : "phone";
  const preview = useMemo(
    () => buildPreviewBlocks(blocks, draft, channel),
    [blocks, draft, channel],
  );

  const content = (
    <>
      {preview.map((block) => (
        <PreviewBlockView key={block.key} block={block} device={device} />
      ))}
      {preview.length === 0 && (
        <div className="py-10 text-center text-[11px] text-slate-400">{t("common.noData")}</div>
      )}
    </>
  );
  const search = t("home.preview.search");

  return (
    // the phone sticks beside the list; the laptop is wide and sits below it
    <Card
      className={device === "phone" ? "sticky top-20" : undefined}
      styles={{ body: { padding: 16 } }}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{t("home.preview.title")}</span>
        <span className="text-xs text-slate-500">
          {t(device === "desktop" ? "home.preview.desktop" : "home.preview.phone")}
        </span>
      </div>

      {device === "phone" ? (
        <Phone search={search}>{content}</Phone>
      ) : (
        <Laptop search={search}>{content}</Laptop>
      )}

      <p className="m-0 mt-4 text-xs text-slate-500">{t("home.preview.note")}</p>
    </Card>
  );
}
