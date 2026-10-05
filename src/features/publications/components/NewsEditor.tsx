import { Alert, App, Form } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { emptyLocalized, failedLang, type ContentLang } from "@/shared/lib/localized";
import { EditorDrawer, ImageField, LangTabs, LocalizedField } from "@/shared/ui";
import { newsHooks } from "../hooks/queries";
import type { NewsInput } from "../model/types";

interface Props {
  /** "new" — create; a number — edit that news item */
  id: number | "new";
  onClose: () => void;
}

type FormValues = Pick<NewsInput, "title" | "description">;

/** News: translated title and text, and a picture (required when created). */
export function NewsEditor({ id, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [lang, setLang] = useState<ContentLang>("uz");
  const [file, setFile] = useState<File>();
  const [imageMissing, setImageMissing] = useState(false);

  const editing = id !== "new";
  const detail = newsHooks.useDetail(editing ? id : null);
  const create = newsHooks.useCreate();
  const update = newsHooks.useUpdate();
  const remove = newsHooks.useRemove();
  const item = detail.data;

  const done = {
    onSuccess: () => {
      message.success(t("common.saved"));
      onClose();
    },
    onError: (error: unknown) => message.error(getErrorMessage(error)),
  };

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch (error) {
      const failed = failedLang(error);
      if (failed) setLang(failed);
      return;
    }
    if (!editing && !file) return setImageMissing(true);

    const input: NewsInput = { ...values, image: file };
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
      title={item ? item.name : t("publications.newTitle.news")}
      onClose={onClose}
      onSave={() => void handleSave()}
      saving={create.isPending || update.isPending}
      loading={editing && detail.isPending}
      onDelete={editing ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("publications.deleteConfirm.news")}
    >
      {detail.error ? (
        <Alert type="error" showIcon title={getErrorMessage(detail.error)} />
      ) : (
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{
            title: item?.title ?? emptyLocalized(),
            description: item?.description ?? emptyLocalized(),
          }}
        >
          <LangTabs value={lang} onChange={setLang} />
          <LocalizedField
            name="title"
            label={t("publications.fields.title")}
            lang={lang}
            maxLength={450}
            requiredMessage={t("publications.ruRequired")}
          />
          <LocalizedField
            name="description"
            label={t("publications.fields.description")}
            lang={lang}
            kind="rich"
            requiredMessage={t("publications.ruRequired")}
          />

          <div className="mb-1.5 text-sm">
            {t("publications.fields.image")} {!editing && <span className="text-red-600">*</span>}
          </div>
          <ImageField
            url={item?.image ?? null}
            file={file}
            onPick={(picked) => {
              setFile(picked);
              setImageMissing(false);
            }}
            hint={t("publications.imageHint")}
          />
          {imageMissing && (
            <div className="mt-1 text-xs text-red-600">{t("publications.imageRequired")}</div>
          )}
        </Form>
      )}
    </EditorDrawer>
  );
}
