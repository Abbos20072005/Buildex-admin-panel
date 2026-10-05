import { Alert, App, Form, Input } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { emptyLocalized, failedLang, type ContentLang } from "@/shared/lib/localized";
import { EditorDrawer, LangTabs, LocalizedField } from "@/shared/ui";
import { videoHooks } from "../hooks/queries";
import type { VideoInput } from "../model/types";

interface Props {
  /** "new" — create; a number — edit that video */
  id: number | "new";
  onClose: () => void;
}

/** Video: translated name and a link (nothing is uploaded). */
export function VideoEditor({ id, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<VideoInput>();
  const [lang, setLang] = useState<ContentLang>("uz");

  const editing = id !== "new";
  const detail = videoHooks.useDetail(editing ? id : null);
  const create = videoHooks.useCreate();
  const update = videoHooks.useUpdate();
  const remove = videoHooks.useRemove();
  const item = detail.data;

  const done = {
    onSuccess: () => {
      message.success(t("common.saved"));
      onClose();
    },
    onError: (error: unknown) => message.error(getErrorMessage(error)),
  };

  const handleSave = async () => {
    let input: VideoInput;
    try {
      input = await form.validateFields();
    } catch (error) {
      const failed = failedLang(error);
      if (failed) setLang(failed);
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
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  return (
    <EditorDrawer
      title={item ? item.name : t("publications.newTitle.videos")}
      onClose={onClose}
      onSave={() => void handleSave()}
      saving={create.isPending || update.isPending}
      loading={editing && detail.isPending}
      onDelete={editing ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("publications.deleteConfirm.videos")}
    >
      {detail.error ? (
        <Alert type="error" showIcon title={getErrorMessage(detail.error)} />
      ) : (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ title: item?.title ?? emptyLocalized(), url: item?.url ?? "" }}
        >
          <LangTabs value={lang} onChange={setLang} />
          <LocalizedField
            name="title"
            label={t("publications.fields.name")}
            lang={lang}
            maxLength={150}
            requiredMessage={t("publications.ruRequired")}
          />
          <Form.Item
            name="url"
            label={
              <>
                {t("publications.fields.url")} <span className="text-red-600">*</span>
              </>
            }
            rules={[
              { required: true, whitespace: true, message: t("publications.required") },
              { pattern: /^https?:\/\/\S+$/i, message: t("publications.urlInvalid") },
            ]}
          >
            <Input placeholder="https://" />
          </Form.Item>
        </Form>
      )}
    </EditorDrawer>
  );
}
