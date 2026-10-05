import { Segmented } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";

type Lang = "uz" | "ru";

export interface PreviewTexts {
  title: string;
  body: string;
}

interface Props {
  texts: Record<Lang, PreviewTexts>;
  /** publish time; empty — now */
  at: Dayjs | null;
}

function Phone({
  platform,
  time,
  date,
  title,
  body,
}: {
  platform: "ios" | "android";
  time: string;
  date: string;
  title: string;
  body: string;
}) {
  const { t } = useTranslation();
  const ios = platform === "ios";

  return (
    <div className="text-center">
      <div className="mb-2 text-xs font-semibold text-slate-500">{ios ? "iOS" : "Android"}</div>
      <div className="relative mx-auto flex h-[370px] w-[190px] flex-col rounded-[34px] border-[7px] border-slate-900 bg-slate-700 px-3 pt-8 pb-4 text-white">
        <div className="text-4xl leading-none font-light tabular-nums">{time}</div>
        <div className="mt-1 text-[11px] text-slate-300 first-letter:uppercase">{date}</div>

        <div
          className={clsx(
            "mt-auto rounded-2xl p-2.5 text-left shadow-lg",
            ios ? "bg-slate-200/95 text-slate-900" : "bg-white text-slate-900",
          )}
        >
          <div className="mb-1 flex items-center gap-1.5 text-[9px] text-slate-500">
            <span className="grid size-4 place-items-center rounded bg-brand text-[9px] font-bold text-white">
              b
            </span>
            <span className={ios ? "font-bold tracking-wide uppercase" : "font-semibold"}>
              {ios ? "BUILDEX GO" : "Buildex Go"}
            </span>
            <span className="ml-auto">{t("push.preview.now")}</span>
          </div>
          <div className="line-clamp-2 text-[11px] leading-snug font-bold">{title}</div>
          <div className="line-clamp-3 text-[11px] leading-snug text-slate-700">{body}</div>
        </div>
      </div>
    </div>
  );
}

/** How the notification looks on a lock screen (iOS and Android), in the chosen language. */
export function PushPreview({ texts, at }: Props) {
  const { t } = useTranslation();
  const [lang, setLang] = useState<Lang>("uz");

  // customers see the Russian text when the Uzbek one is empty — the preview does the same
  const current = texts[lang];
  const title = current.title.trim() || texts.ru.title.trim() || t("push.preview.titlePlaceholder");
  const body = current.body.trim() || texts.ru.body.trim() || t("push.preview.textPlaceholder");

  const moment = at ?? dayjs();
  const shared = {
    time: moment.format("HH:mm"),
    date: moment.format("dddd, DD.MM.YYYY"),
    title,
    body,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-bold">{t("push.preview.title")}</div>
        <Segmented<Lang>
          size="small"
          value={lang}
          onChange={setLang}
          options={[
            { value: "uz", label: "UZ" },
            { value: "ru", label: "RU" },
          ]}
        />
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Phone platform="ios" {...shared} />
        <Phone platform="android" {...shared} />
      </div>
    </div>
  );
}
