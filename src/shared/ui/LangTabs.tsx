import { clsx } from "@/shared/lib/clsx";
import type { ContentLang } from "@/shared/lib/localized";

const LANGS: { code: ContentLang; label: string; dot: string }[] = [
  { code: "uz", label: "O‘zbekcha", dot: "bg-emerald-600" },
  { code: "ru", label: "Русский", dot: "bg-brand-yellow" },
  { code: "en", label: "English", dot: "bg-brand" },
];

interface Props {
  value: ContentLang;
  onChange: (lang: ContentLang) => void;
}

/** Language tabs above the translated fields of a form (same look as the banner editor). */
export function LangTabs({ value, onChange }: Props) {
  return (
    <div className="mb-4 flex gap-6 border-b border-slate-200">
      {LANGS.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => onChange(item.code)}
          className={clsx(
            "-mb-px flex cursor-pointer items-center gap-2 border-0 border-b-2 bg-transparent py-2.5 text-sm font-bold",
            value === item.code
              ? "border-brand text-brand"
              : "border-transparent text-slate-500 hover:text-slate-700",
          )}
        >
          <span className={clsx("size-2 rounded-full", item.dot)} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
