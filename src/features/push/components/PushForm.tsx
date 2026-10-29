import { ChevronLeftIcon } from "@/shared/icons";
import {
  Alert,
  App,
  Button,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Select,
  Switch,
  Tag,
  TimePicker,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/shared/api";
import { useEditorForm } from "@/shared/form";
import { clsx } from "@/shared/lib/clsx";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { ImageField } from "@/shared/ui";
import {
  useCreatePush,
  useDeletePush,
  useTargetOptionsQuery,
  useUpdatePush,
} from "../hooks/queries";
import { LINK_TYPES, PLATFORMS, PUSH_PATH, STATUS_COLOR, TITLE_MAX } from "../model/constants";
import type {
  Push,
  PushImage,
  PushInput,
  PushLinkType,
  PushPlatform,
  PushSegment,
  PushTargetModel,
} from "../model/types";
import { AudienceField } from "./AudienceField";
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
  linkType: PushLinkType;
  /** "model:id" */
  target: string | null;
  page: string;
  deeplink: string;
  segment: PushSegment;
  platform: PushPlatform;
  quietHours: boolean;
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
    linkType: push?.linkType ?? "",
    target: push?.target ? `${push.target.model}:${push.target.id}` : null,
    page: push?.page ?? "",
    deeplink: push?.linkType ? "" : (push?.deeplink ?? ""),
    segment: push?.segment ?? "all",
    platform: push?.platform ?? "all",
    quietHours: push?.quietHours ?? false,
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

const card = "rounded-xl border border-slate-200 bg-white p-5";

/** Create / edit page of a notification: texts, link, audience and schedule; a lock-screen preview. */
export function PushForm({ push }: { push: Push | null }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  // the schedule is two form fields (date, time) but one API field
  const guard = useEditorForm(form, { publish_at: "date", link_type: "linkType" });
  const [lang, setLang] = useState<Lang>("uz");
  const [image, setImage] = useState<PushImage>({});
  const [targetSearch, setTargetSearch] = useState("");

  const create = useCreatePush();
  const update = useUpdatePush();
  const remove = useDeletePush();

  const values = Form.useWatch((all: FormValues) => all, { form, preserve: true }) as
    Partial<FormValues> | undefined;
  const at = combine(values?.date, values?.time);
  const scheduled = !!at && at.isAfter(dayjs());
  const isDraft = !push || push.status === "draft";
  const linkType = values?.linkType ?? push?.linkType ?? "";
  const platform = values?.platform ?? push?.platform ?? "all";
  /** the push has gone out: the audience can't change any more */
  const audienceLocked = !!push?.pushSentAt;

  const targets = useTargetOptionsQuery(linkType, useDebouncedValue(targetSearch, 300));
  const targetOptions = useMemo(() => {
    const groups = new Map<PushTargetModel, { value: string; label: string }[]>();
    for (const option of targets.data ?? []) {
      const list = groups.get(option.model) ?? [];
      list.push({ value: `${option.model}:${option.id}`, label: option.name });
      groups.set(option.model, list);
    }
    // the saved target may be missing from the first page of the list
    const saved = push?.target;
    if (saved && saved.name && linkType === push?.linkType) {
      const list = groups.get(saved.model) ?? [];
      const value = `${saved.model}:${saved.id}`;
      if (!list.some((option) => option.value === value)) {
        groups.set(saved.model, [{ value, label: saved.name }, ...list]);
      }
    }
    return [...groups.entries()].map(([model, options]) => ({
      label: t(`push.targetModels.${model}`),
      options,
    }));
  }, [targets.data, push, linkType, t]);

  /** the picture shown in the preview: the new file, else the saved one (unless removed) */
  const previewImage = useMemo(
    () =>
      image.file ? URL.createObjectURL(image.file) : image.clear ? null : (push?.image ?? null),
    [image, push?.image],
  );

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
    } catch (error) {
      // the labels carry a character counter, so name the translated fields by hand
      const fields = (error as { errorFields?: { name: (string | number)[]; errors: string[] }[] })
        .errorFields;
      const lines = (fields ?? []).map(({ name, errors }) => {
        const match = /^(title|body)(Uz|Ru)$/.exec(String(name[0]));
        if (!match) return errors[0] ?? "";
        const label = t(match[1] === "title" ? "push.fields.title" : "push.fields.text");
        return `${label} (${match[2].toUpperCase()}): ${errors[0] ?? ""}`;
      });
      if (lines.length) message.error(lines.join(" · "));
      // the error may be on the other language tab
      if (!form.getFieldValue("titleRu")?.trim() || !form.getFieldValue("bodyRu")?.trim()) {
        setLang("ru");
      }
      return;
    }
    const v = form.getFieldsValue(true) as FormValues;
    let target: PushInput["target"] = null;
    if (v.target) {
      const [model, id] = v.target.split(":");
      target = { model: model as PushTargetModel, id: Number(id) };
    }
    const input: PushInput = {
      titleUz: v.titleUz,
      titleRu: v.titleRu,
      bodyUz: v.bodyUz,
      bodyRu: v.bodyRu,
      linkType: v.linkType,
      target,
      page: v.page ?? "",
      deeplink: v.deeplink ?? "",
      segment: audienceLocked ? null : v.segment,
      platform: audienceLocked ? null : v.platform,
      quietHours: v.quietHours,
      publishAt: combine(v.date, v.time)?.format(API_FORMAT) ?? null,
      isActive,
    };
    const done = {
      onSuccess: () => {
        message.success(t("push.saved"));
        guard.saved();
        navigate(PUSH_PATH);
      },
      onError: guard.showError,
    };
    if (push) update.mutate({ id: push.id, input, image }, done);
    else create.mutate({ input, image }, done);
  };

  const handleDelete = () => {
    if (!push) return;
    remove.mutate(push.id, {
      onSuccess: () => {
        message.success(t("push.deleted"));
        guard.saved();
        navigate(PUSH_PATH);
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  const saving = create.isPending || update.isPending;
  const hasSavedImage = !!push?.image && !image.clear;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to={PUSH_PATH} className="text-sm font-semibold">
            <ChevronLeftIcon className="mr-1 text-xs" />
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
          {push?.pushSentAt && (
            <div className="mt-1 text-xs text-slate-500">
              {t("push.sentInfo", {
                devices: push.pushDevices,
                opened: push.reads,
              })}
            </div>
          )}
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
        {...guard.formProps}
        disabled={saving}
        layout="vertical"
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

          <div className={card}>
            <div className="mb-2 text-sm font-semibold">{t("push.fields.image")}</div>
            <ImageField
              url={hasSavedImage ? (push?.image ?? null) : null}
              file={image.file}
              onPick={(file) => {
                setImage({ file });
                guard.markDirty();
              }}
              hint={t("push.imageHint")}
            />
            {(hasSavedImage || image.file) && (
              <Button
                size="small"
                className="mt-2"
                onClick={() => {
                  setImage({ clear: true });
                  guard.markDirty();
                }}
              >
                {t("push.removeImage")}
              </Button>
            )}
          </div>

          <div className={card}>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Form.Item name="linkType" label={t("push.fields.linkType")}>
                <Select
                  options={LINK_TYPES.map((value) => ({
                    value,
                    label: t(`push.linkTypes.${value || "none"}`),
                  }))}
                  onChange={() => form.setFieldsValue({ target: null })}
                />
              </Form.Item>

              {linkType !== "" && linkType !== "page" && (
                <Form.Item
                  name="target"
                  label={required(t("push.fields.target"))}
                  rules={[{ required: true, message: t("push.targetRequired") }]}
                >
                  <Select
                    showSearch={{ filterOption: false, onSearch: setTargetSearch }}
                    loading={targets.isFetching}
                    placeholder={t("push.chooseTarget")}
                    options={targetOptions}
                  />
                </Form.Item>
              )}

              {linkType === "page" && (
                <Form.Item
                  name="page"
                  label={required(t("push.fields.page"))}
                  rules={[
                    { required: true, message: t("push.pageRequired") },
                    { pattern: /^\//, message: t("push.pageInvalid") },
                  ]}
                >
                  <Input placeholder="/pro" className="font-mono" />
                </Form.Item>
              )}
            </div>

            {linkType === "" ? (
              <Form.Item
                name="deeplink"
                label={t("push.fields.deeplink")}
                extra={t("push.deeplinkHint")}
                className="mb-0"
              >
                <Input
                  maxLength={255}
                  placeholder="buildex://category/sement"
                  className="font-mono"
                />
              </Form.Item>
            ) : (
              <div className="text-xs text-slate-500">
                {t("push.deeplinkAuto")}
                {push?.deeplink && push.linkType === linkType && (
                  <code className="ml-1 font-mono">{push.deeplink}</code>
                )}
              </div>
            )}
          </div>

          <div className={card}>
            <div className="mb-3 text-sm font-semibold">{t("push.fields.audience")}</div>
            <Form.Item name="segment" noStyle>
              <AudienceField platform={platform} disabled={audienceLocked} />
            </Form.Item>
            <Form.Item
              name="platform"
              label={t("push.fields.platform")}
              className="mt-4 mb-0 max-w-xs"
            >
              <Select
                disabled={audienceLocked}
                options={PLATFORMS.map((value) => ({
                  value,
                  label: t(`push.platforms.${value}`),
                }))}
              />
            </Form.Item>
            <div className="mt-2 text-xs text-slate-500">
              {audienceLocked ? t("push.audienceLocked") : t("push.platformHint")}
            </div>
          </div>

          <div className={card}>
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

            <label className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <span>
                <span className="block text-sm font-semibold">{t("push.fields.quietHours")}</span>
                <span className="block text-xs text-slate-500">{t("push.quietHoursHint")}</span>
              </span>
              <Form.Item name="quietHours" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </label>
          </div>
        </div>

        <PushPreview
          at={at}
          image={previewImage}
          texts={{
            uz: { title: values?.titleUz ?? "", body: values?.bodyUz ?? "" },
            ru: { title: values?.titleRu ?? "", body: values?.bodyRu ?? "" },
          }}
        />
      </Form>
    </>
  );
}
