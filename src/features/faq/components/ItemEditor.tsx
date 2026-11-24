import { App, Form, Input, Select, Switch } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { reportInvalid, useEditorForm } from "@/shared/form";
import { isBlankHtml } from "@/shared/lib/localized";
import { EditorDrawer, RichTextEditor } from "@/shared/ui";
import { byLang } from "../lib/display";
import { useCreateFaqItem, useDeleteFaqItem, useUpdateFaqItem } from "../hooks/queries";
import {
  DEFAULT_PAGE_KEYS,
  FAQ_PAGE_KEYS,
  type FaqItem,
  type FaqItemInput,
  type FaqTopic,
} from "../model/types";

interface Props {
  /** null — a new question */
  item: FaqItem | null;
  topics: FaqTopic[];
  /** the topic a new question starts in (the one chosen in the list's filter) */
  defaultTopicId?: number;
  onClose: () => void;
}

/** A language block of the form: both languages are required, so both are always visible. */
function LangBlock({ dot, title, children }: { dot: string; title: string; children: ReactNode }) {
  return (
    <section className="mb-5 rounded-xl border border-slate-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold">
        <span className={`size-2 rounded-full ${dot}`} />
        {title}
      </div>
      {children}
    </section>
  );
}

/** Question: topic, text and answer in both languages, the pages it is shown on, visibility. */
export function ItemEditor({ item, topics, defaultTopicId, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<FaqItemInput>();
  const guard = useEditorForm(form, { topic: "topicId" });

  const create = useCreateFaqItem();
  const update = useUpdateFaqItem();
  const remove = useDeleteFaqItem();
  const saving = create.isPending || update.isPending;

  const handleSave = async () => {
    let input: FaqItemInput;
    try {
      input = await form.validateFields();
    } catch (error) {
      reportInvalid(error, message);
      return;
    }
    const done = {
      onSuccess: () => {
        message.success(t("common.saved"));
        guard.saved();
        onClose();
      },
      onError: guard.showError,
    };
    if (item) update.mutate({ id: item.id, input }, done);
    else create.mutate(input, done);
  };

  const handleDelete = () => {
    if (!item) return;
    remove.mutate(item.id, {
      onSuccess: () => {
        message.success(t("common.deleted"));
        guard.saved();
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  const required = <span className="text-red-600">*</span>;
  const requiredAnswer = (_: unknown, value: string | undefined) =>
    isBlankHtml(value) ? Promise.reject(new Error(t("faq.required"))) : Promise.resolve();

  return (
    <EditorDrawer
      size={760}
      title={item ? byLang(item.questionUz, item.questionRu, i18n.language) : t("faq.newItem")}
      onClose={() => guard.confirmClose(onClose)}
      onSave={() => void handleSave()}
      saving={saving}
      onDelete={item ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("faq.deleteItemConfirm")}
    >
      <Form<FaqItemInput>
        form={form}
        {...guard.formProps}
        disabled={saving}
        layout="vertical"
        initialValues={{
          topicId: item?.topic.id ?? defaultTopicId,
          questionUz: item?.questionUz ?? "",
          questionRu: item?.questionRu ?? "",
          answerUz: item?.answerUz ?? "",
          answerRu: item?.answerRu ?? "",
          pageKeys: item?.pageKeys ?? DEFAULT_PAGE_KEYS,
          isActive: item?.isActive ?? true,
        }}
      >
        <Form.Item
          name="topicId"
          label={
            <>
              {t("faq.fields.topic")} {required}
            </>
          }
          rules={[{ required: true, message: t("faq.required") }]}
        >
          <Select
            showSearch={{
              filterOption: (input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }}
            placeholder={t("faq.fields.topicPlaceholder")}
            options={topics.map((topic) => ({
              value: topic.id,
              label: byLang(topic.nameUz, topic.nameRu, i18n.language),
            }))}
          />
        </Form.Item>

        <LangBlock dot="bg-emerald-600" title="O‘zbekcha">
          <Form.Item
            name="questionUz"
            label={
              <>
                {t("faq.fields.question")} {required}
              </>
            }
            rules={[{ required: true, whitespace: true, message: t("faq.required") }]}
          >
            <Input maxLength={500} showCount />
          </Form.Item>
          <Form.Item
            name="answerUz"
            label={
              <>
                {t("faq.fields.answer")} {required}
              </>
            }
            rules={[{ validator: requiredAnswer }]}
            className="mb-0"
          >
            <RichTextEditor answer minHeight={140} />
          </Form.Item>
        </LangBlock>

        <LangBlock dot="bg-brand-yellow" title="Русский">
          <Form.Item
            name="questionRu"
            label={
              <>
                {t("faq.fields.question")} {required}
              </>
            }
            rules={[{ required: true, whitespace: true, message: t("faq.required") }]}
          >
            <Input maxLength={500} showCount />
          </Form.Item>
          <Form.Item
            name="answerRu"
            label={
              <>
                {t("faq.fields.answer")} {required}
              </>
            }
            rules={[{ validator: requiredAnswer }]}
            className="mb-0"
          >
            <RichTextEditor answer minHeight={140} />
          </Form.Item>
        </LangBlock>

        <Form.Item name="pageKeys" label={t("faq.fields.pages")} extra={t("faq.pagesHint")}>
          <Select<string[]>
            mode="multiple"
            allowClear
            options={FAQ_PAGE_KEYS.map((key) => ({ value: key, label: t(`faq.pageKeys.${key}`) }))}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label={t("faq.fields.visible")}
          valuePropName="checked"
          extra={t("faq.itemVisibleHint")}
          className="mb-0"
        >
          <Switch />
        </Form.Item>
      </Form>
    </EditorDrawer>
  );
}
