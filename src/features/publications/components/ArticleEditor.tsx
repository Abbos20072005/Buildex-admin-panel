import { Alert, App, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useEditorForm } from "@/shared/form";
import { isBlankHtml } from "@/shared/lib/localized";
import { EditorDrawer, RichTextEditor } from "@/shared/ui";
import { articleHooks } from "../hooks/queries";
import type { ArticleInput } from "../model/types";

interface Props {
  /** "new" — create; a number — edit that article */
  id: number | "new";
  onClose: () => void;
}

/** Article: title, short text and the full HTML text — one value each, not translated. */
export function ArticleEditor({ id, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<ArticleInput>();
  const guard = useEditorForm(form);

  const editing = id !== "new";
  const detail = articleHooks.useDetail(editing ? id : null);
  const create = articleHooks.useCreate();
  const update = articleHooks.useUpdate();
  const remove = articleHooks.useRemove();
  const item = detail.data;

  const required = [{ required: true, whitespace: true, message: t("publications.required") }];
  const done = {
    onSuccess: () => {
      message.success(t("common.saved"));
      guard.saved();
      onClose();
    },
    onError: guard.showError,
  };

  const handleSave = async () => {
    let input: ArticleInput;
    try {
      input = await form.validateFields();
    } catch {
      return;
    }
    if (editing) update.mutate({ id, input }, done);
    else create.mutate(input, done);
  };

  const handleDelete = () => {
    if (!editing) return;
    remove.mutate(id, {
      onSuccess: () => {
        message.success(t("common.deleted"));
        guard.saved();
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  return (
    <EditorDrawer
      title={item ? item.title : t("publications.newTitle.articles")}
      onClose={() => guard.confirmClose(onClose)}
      onSave={() => void handleSave()}
      saving={create.isPending || update.isPending}
      loading={editing && detail.isPending}
      onDelete={editing ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("publications.deleteConfirm.articles")}
    >
      {detail.error ? (
        <Alert type="error" showIcon title={getErrorMessage(detail.error)} />
      ) : (
        <Form
          form={form}
          {...guard.formProps}
          disabled={create.isPending || update.isPending}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            title: item?.title ?? "",
            shortDescription: item?.shortDescription ?? "",
            description: item?.description ?? "",
          }}
        >
          <Form.Item name="title" label={t("publications.fields.title")} rules={required}>
            <Input maxLength={450} showCount />
          </Form.Item>
          <Form.Item
            name="shortDescription"
            label={t("publications.fields.shortDescription")}
            rules={required}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t("publications.fields.description")}
            rules={[
              {
                validator: (_, value: string) =>
                  isBlankHtml(value)
                    ? Promise.reject(new Error(t("publications.required")))
                    : Promise.resolve(),
              },
            ]}
          >
            <RichTextEditor minHeight={220} />
          </Form.Item>
        </Form>
      )}
    </EditorDrawer>
  );
}
