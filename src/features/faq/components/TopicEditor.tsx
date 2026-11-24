import { Alert, App, Form, Input, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { reportInvalid, useEditorForm } from "@/shared/form";
import { EditorDrawer } from "@/shared/ui";
import { useCreateFaqTopic, useDeleteFaqTopic, useUpdateFaqTopic } from "../hooks/queries";
import type { FaqTopic, FaqTopicInput } from "../model/types";

interface Props {
  /** null — a new topic */
  topic: FaqTopic | null;
  onClose: () => void;
}

const SLUG_PATTERN = /^[A-Za-z0-9_-]+$/;

/** Topic of the questions: its name in both languages, the address part (slug), visibility. */
export function TopicEditor({ topic, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<FaqTopicInput>();
  const guard = useEditorForm(form);

  const create = useCreateFaqTopic();
  const update = useUpdateFaqTopic();
  const remove = useDeleteFaqTopic();
  const saving = create.isPending || update.isPending;
  // the API refuses to delete a topic with questions — hide it instead
  const hasItems = (topic?.itemsCount ?? 0) > 0;

  const handleSave = async () => {
    let input: FaqTopicInput;
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
    if (topic) update.mutate({ id: topic.id, input }, done);
    else create.mutate(input, done);
  };

  const handleDelete = () => {
    if (!topic) return;
    remove.mutate(topic.id, {
      onSuccess: () => {
        message.success(t("common.deleted"));
        guard.saved();
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  const required = <span className="text-red-600">*</span>;

  return (
    <EditorDrawer
      size={480}
      title={topic ? topic.name : t("faq.newTopic")}
      onClose={() => guard.confirmClose(onClose)}
      onSave={() => void handleSave()}
      saving={saving}
      onDelete={topic && !hasItems ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("faq.deleteTopicConfirm")}
    >
      <Form<FaqTopicInput>
        form={form}
        {...guard.formProps}
        disabled={saving}
        layout="vertical"
        initialValues={{
          nameUz: topic?.nameUz ?? "",
          nameRu: topic?.nameRu ?? "",
          slug: topic?.slug ?? "",
          isActive: topic?.isActive ?? true,
        }}
      >
        <Form.Item
          name="nameUz"
          label={
            <>
              {t("faq.fields.nameUz")} {required}
            </>
          }
          rules={[{ required: true, whitespace: true, message: t("faq.required") }]}
        >
          <Input maxLength={150} showCount />
        </Form.Item>
        <Form.Item
          name="nameRu"
          label={
            <>
              {t("faq.fields.nameRu")} {required}
            </>
          }
          rules={[{ required: true, whitespace: true, message: t("faq.required") }]}
        >
          <Input maxLength={150} showCount />
        </Form.Item>
        <Form.Item
          name="slug"
          label={
            <>
              {t("faq.fields.slug")} {required}
            </>
          }
          extra={t("faq.slugHint")}
          rules={[
            { required: true, whitespace: true, message: t("faq.required") },
            { pattern: SLUG_PATTERN, message: t("faq.slugInvalid") },
          ]}
        >
          <Input maxLength={100} placeholder="delivery" />
        </Form.Item>
        <Form.Item
          name="isActive"
          label={t("faq.fields.visible")}
          valuePropName="checked"
          extra={t("faq.topicVisibleHint")}
          className="mb-0"
        >
          <Switch />
        </Form.Item>
        {topic && hasItems && (
          <Alert
            className="mt-4"
            type="info"
            showIcon
            title={t("faq.topicHasItems", { count: topic.itemsCount })}
          />
        )}
      </Form>
    </EditorDrawer>
  );
}
