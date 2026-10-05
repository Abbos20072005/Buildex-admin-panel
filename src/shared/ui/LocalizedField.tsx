import { Form, Input } from "antd";
import { CONTENT_LANGS, isBlankHtml, type ContentLang } from "@/shared/lib/localized";
import { RichTextEditor } from "./RichTextEditor";

interface Props {
  /** form value is `{ uz, ru, en }` under this name */
  name: string;
  label: string;
  /** the language tab that is open — the other fields stay in the form, but hidden */
  lang: ContentLang;
  kind?: "text" | "rich";
  maxLength?: number;
  /** shown when the Russian (required) value is empty */
  requiredMessage: string;
}

/** One translated field: three form items (uz / ru / en), only the active language is visible. */
export function LocalizedField({
  name,
  label,
  lang,
  kind = "text",
  maxLength,
  requiredMessage,
}: Props) {
  return (
    <>
      {CONTENT_LANGS.map((code) => (
        <Form.Item
          key={code}
          name={[name, code]}
          hidden={code !== lang}
          label={
            <>
              {label} {code === "ru" && <span className="text-red-600">*</span>}
            </>
          }
          rules={
            code === "ru"
              ? [
                  {
                    validator: (_, value: string | undefined) =>
                      (kind === "rich" ? isBlankHtml(value) : !value?.trim())
                        ? Promise.reject(new Error(requiredMessage))
                        : Promise.resolve(),
                  },
                ]
              : []
          }
        >
          {kind === "rich" ? (
            <RichTextEditor minHeight={180} />
          ) : (
            <Input maxLength={maxLength} showCount={!!maxLength} />
          )}
        </Form.Item>
      ))}
    </>
  );
}
