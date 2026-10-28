import { Form, Segmented } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LANGUAGES, type LanguageCode } from "@/shared/i18n";
import { RichTextEditor } from "@/shared/ui";

/**
 * The text under the products of the category page, in Uzbek and in Russian. Both languages
 * live in the form; only the picked one is shown, so editing one never changes the other.
 */
export function CategoryDescription() {
  const { t } = useTranslation();
  const [lang, setLang] = useState<LanguageCode>("uz");

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-semibold">{t("categories.description")}</span>
        <Segmented
          value={lang}
          onChange={setLang}
          options={LANGUAGES.map((language) => ({ value: language.code, label: language.short }))}
        />
      </div>
      <p className="m-0 mb-3 text-xs text-slate-500">{t("categories.descriptionHint")}</p>
      <Form.Item key={`text-${lang}`} name={["description", lang]} className="mb-0">
        <RichTextEditor extended minHeight={180} />
      </Form.Item>
    </div>
  );
}
