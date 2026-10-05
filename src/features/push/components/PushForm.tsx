import { LeftOutlined } from "@ant-design/icons";
import { Alert, App, Button, DatePicker, Form, Input, Popconfirm, Tag, TimePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { useCreatePush, useDeletePush, useUpdatePush } from "../hooks/queries";
import { PUSH_PATH, STATUS_COLOR, TITLE_MAX } from "../model/constants";
import type { Push, PushInput } from "../model/types";
import { PushPreview } from "./PushPreview";

type Lang = "uz" | "ru";

const LANGS: { code: Lang; label: string }[] = [
  { code: "uz", label: "O‘zbekcha" },
  { code: "ru", label: "Русский" },
];

/** Editable state of the form; the date and the time are separate dayjs values. */
interface FormValues {
  titleUz: string;
  titleRu: string;
  bodyUz: string;
  bodyRu: string;
  deeplink: string;
  date: Dayjs | null;
  time: Dayjs | null;
}

const API_FORMAT = "YYYY-MM-DDTHH:mm:ss";
const DEFAULT_TIME = dayjs().hour(10).minute(0);

const initialValues = (push: Push | null): FormValues => {
  // a draft has no publish time chosen yet; the others show the saved one
  const saved = push && push.status !== "draft" ? dayjs(push.publishAt) : null;
  return {
    titleUz: push?.titleUz ?? "",
    titleRu: push?.titleRu ?? "",
    bodyUz: push?.bodyUz ?? "",
    bodyRu: push?.bodyRu ?? "",
    deeplink: push?.deeplink ?? "",
    date: saved,
    time: saved ?? DEFAULT_TIME,
  };
};

/** date + time → "YYYY-MM-DDTHH:mm:ss" (Tashkent time); no date — null, i.e. "now". */
const combine = (date: Dayjs | null | undefined, time: Dayjs | null | undefined) =>
  date
    ? date
        .hour((time ?? DEFAULT_TIME).hour())
        .minute((time ?? DEFAULT_TIME).minute())
        .second(0)
    : null;

const required = (label: string) => (
  <>
    {label} <span className="text-red-600">*</span>
  </>
);

/** Create / edit page of a notification: the texts and the schedule on the left, a lock-screen preview on the right. */
export function PushForm({ push }: { push: Push | null }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [lang, setLang] = useState<Lang>("uz");

  const create = useCreatePush();
  const update = useUpdatePush();
  const remove = useDeletePush();

  const values = Form.useWatch((all: FormValues) => all, { form, preserve: true }) as
    Partial<FormValues> | undefined;
  const at = combine(values?.date, values?.time);
  const scheduled = !!at && at.isAfter(dayjs());
  const isDraft = !push || push.status === "draft";

  /** green — both texts are filled in; red — one is missing (Russian is required) */
  const langDone = (code: Lang) => {
    const title = values?.[code === "uz" ? "titleUz" : "titleRu"]?.trim();
    const body = values?.[code === "uz" ? "bodyUz" : "bodyRu"]?.trim();
    if (title && body) return "bg-emerald-600";
    return code === "uz" && !title && !body ? "bg-slate-300" : "bg-red-600";
  };

  const handleSave = async (isActive: boolean) => {
    try {
      await form.validateFields();
    } catch {
      // the error may be on the other language tab
      if (!form.getFieldValue("titleRu")?.trim() || !form.getFieldValue("bodyRu")?.trim()) {
        setLang("ru");
      }
      return;
    }
    const v = form.getFieldsValue(true) as FormValues;
    const input: PushInput = {
      titleUz: v.titleUz,
      titleRu: v.titleRu,
      bodyUz: v.bodyUz,
      bodyRu: v.bodyRu,
      deeplink: v.deeplink,
      publishAt: combine(v.date, v.time)?.format(API_FORMAT) ?? null,
      isActive,
    };
    const done = {
      onSuccess: () => {
        message.success(t("push.saved"));
        navigate(PUSH_PATH);
      },
      onError: (error: unknown) => message.error(getErrorMessage(error)),
    };
    if (push) update.mutate({ id: push.id, input }, done);
    else create.mutate(input, done);
  };

  const handleDelete = () => {
    if (!push) return;
    remove.mutate(push.id, {
      onSuccess: () => {
        message.success(t("push.deleted"));
        navigate(PUSH_PATH);
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  const saving = create.isPending || update.isPending;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to={PUSH_PATH} className="text-sm font-semibold">
            <LeftOutlined className="mr-1 text-xs" />
            {t("nav.push")}
          </Link>
          <h1 className="m-0 mt-1 flex items-center gap-3 text-2xl font-bold tracking-tight">
            {push ? push.title : t("push.newTitle")}
            <Tag
              color={STATUS_COLOR[push?.status ?? "draft"]}
              variant="filled"
              className="m-0 font-semibold"
            >
              {t(`push.status.${push?.status ?? "draft"}`)}
            </Tag>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {push && (
            <Popconfirm
              title={t("push.deleteConfirm")}
              okText={t("common.delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("common.cancel")}
              onConfirm={handleDelete}
            >
              <Button danger loading={remove.isPending}>
                {t("common.delete")}
              </Button>
            </Popconfirm>
          )}
          <Button disabled={saving} onClick={() => void handleSave(false)}>
            {t(isDraft ? "push.saveDraft" : "push.toDraft")}
          </Button>
          <Button type="primary" loading={saving} onClick={() => void handleSave(true)}>
            {t(isDraft ? (scheduled ? "push.schedule" : "push.send") : "push.save")}
          </Button>
        </div>
      </div>

      <Alert type="info" showIcon className="mb-4" title={t("push.info")} />

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={initialValues(push)}
        className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_460px]"
      >
        <div className="flex min-w-0 flex-col gap-4">
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
                  <span className={clsx("size-2 rounded-full", langDone(item.code))} />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {LANGS.map(({ code }) => {
                const suffix = code === "uz" ? "Uz" : "Ru";
                const isRu = code === "ru";
                const title = values?.[`title${suffix}`] ?? "";
                const body = values?.[`body${suffix}`] ?? "";
                const rules = isRu
                  ? [{ required: true, whitespace: true, message: t("push.ruRequired") }]
                  : [];
                const label = (text: string, counter: string) => (
                  <span className="flex w-full items-center justify-between gap-2">
                    <span>{isRu ? required(text) : text}</span>
                    <span className="text-xs font-normal text-slate-400">{counter}</span>
                  </span>
                );
                return (
                  <div key={code} className={lang === code ? "" : "hidden"}>
                    <Form.Item
                      name={`title${suffix}`}
                      label={label(t("push.fields.title"), `${title.length} / ${TITLE_MAX}`)}
                      className="[&_.ant-form-item-label>label]:w-full"
                      rules={rules}
                    >
                      <Input maxLength={TITLE_MAX} />
                    </Form.Item>
                    <Form.Item
                      name={`body${suffix}`}
                      label={label(t("push.fields.text"), String(body.length))}
                      className="mb-0 [&_.ant-form-item-label>label]:w-full"
                      extra={isRu ? undefined : t("push.uzHint")}
                      rules={rules}
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <Form.Item
              name="deeplink"
              label={t("push.fields.deeplink")}
              extra={t("push.deeplinkHint")}
            >
              <Input
                maxLength={255}
                placeholder="buildex://category/sement"
                className="font-mono"
              />
            </Form.Item>

            <div className="grid gap-x-4 sm:grid-cols-[1fr_auto]">
              <Form.Item name="date" label={t("push.fields.date")} className="mb-2">
                <DatePicker format="DD.MM.YYYY" className="w-full" />
              </Form.Item>
              <Form.Item name="time" label={t("push.fields.time")} className="mb-2">
                <TimePicker format="HH:mm" minuteStep={5} allowClear={false} className="w-full" />
              </Form.Item>
            </div>
            <div className="text-xs text-slate-500">
              {t(scheduled ? "push.scheduledHint" : "push.nowHint")}
            </div>
          </div>
        </div>

        <PushPreview
          at={at}
          texts={{
            uz: { title: values?.titleUz ?? "", body: values?.bodyUz ?? "" },
            ru: { title: values?.titleRu ?? "", body: values?.bodyRu ?? "" },
          }}
        />
      </Form>
    </>
  );
}
