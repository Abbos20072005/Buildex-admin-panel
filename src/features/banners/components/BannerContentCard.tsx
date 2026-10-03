import { Button, Input } from "antd";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";

const LANGS = [
  { code: "uz", label: "O‘zbekcha", dot: "bg-emerald-600" },
  { code: "ru", label: "Русский", dot: "bg-brand-yellow" },
] as const;

const BUTTON_MAX = 24;

const required = (text: string) => (
  <>
    {text} <span className="text-red-600">*</span>
  </>
);

/**
 * Language tabs + pictures + alt / button text.
 * The API has no per-language pictures or texts yet — the texts are local, not sent.
 */
export function BannerContentCard({ images }: { images: ReactNode }) {
  const { t } = useTranslation();
  const [lang, setLang] = useState<(typeof LANGS)[number]["code"]>("uz");
  const [texts, setTexts] = useState({ uz: { alt: "", button: "" }, ru: { alt: "", button: "" } });
  const current = texts[lang];
  const change = (patch: Partial<typeof current>) =>
    setTexts((all) => ({ ...all, [lang]: { ...all[lang], ...patch } }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex gap-6 border-b border-slate-200 px-5">
        {LANGS.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            className={clsx(
              "-mb-px flex cursor-pointer items-center gap-2 border-0 border-b-2 bg-transparent py-3 text-sm font-bold",
              lang === item.code
                ? "border-brand text-brand"
                : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            <span className={clsx("size-2 rounded-full", item.dot)} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {images}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button>{t("banners.library")}</Button>
          <span className="text-xs text-slate-500">{t("banners.sizesHint")}</span>
        </div>
        <p className="m-0 mt-3 text-xs text-slate-500">{t("banners.squareHint")}</p>

        <div className="mt-4 mb-1.5 text-sm font-bold">{required(t("banners.altText"))}</div>
        <Input value={current.alt} onChange={(e) => change({ alt: e.target.value })} />

        <div className="mt-4 mb-1.5 flex items-center justify-between text-sm font-bold">
          <span>{required(t("banners.buttonText"))}</span>
          <span className="text-xs font-normal text-slate-400">
            {current.button.length} / {BUTTON_MAX}
          </span>
        </div>
        <Input
          value={current.button}
          maxLength={BUTTON_MAX}
          onChange={(e) => change({ button: e.target.value })}
        />
      </div>
    </div>
  );
}
