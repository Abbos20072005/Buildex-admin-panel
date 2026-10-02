import { Card, Form, Input, Segmented } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getLanguage, LANGUAGES, type LanguageCode } from "@/shared/i18n";
import { RichTextEditor } from "@/shared/ui";

/** Name and description with a language switcher (UZ / RU). */
export function ProductContentCard() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState<LanguageCode>(getLanguage(i18n.language).code);

  const options = LANGUAGES.map((language) => ({ value: language.code, label: language.short }));

  return (
    <Card
      title={t("products.modal.content")}
      extra={<Segmented value={lang} options={options} onChange={setLang} />}
    >
      <Form.Item
        key={`name-${lang}`}
        name={["names", lang]}
        label={t("products.modal.name")}
        rules={[{ max: 500 }]}
      >
        <Input showCount maxLength={500} />
      </Form.Item>

      <Form.Item name="shortDescription" label={t("products.modal.shortDescription")}>
        <RichTextEditor minHeight={60} />
      </Form.Item>

      <Form.Item
        key={`description-${lang}`}
        name={["descriptions", lang]}
        label={t("products.modal.description")}
        className="mb-0"
      >
        <RichTextEditor minHeight={180} />
      </Form.Item>
    </Card>
  );
}
