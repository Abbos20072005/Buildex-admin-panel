import { LeftOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Segmented,
  Select,
  Switch,
  Tag,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/shared/api";
import { WidgetCard } from "@/shared/ui";
import { BannerContentCard } from "./BannerContentCard";
import { BannerImageDrop } from "./BannerImageDrop";
import {
  useCreateBanner,
  useDeleteBanner,
  useSetBannerVisible,
  useUpdateBanner,
} from "../hooks/queries";
import {
  BANNERS_PATH,
  LINK_TYPES,
  PLACEMENTS,
  STATUS_COLOR,
  TARGET_LINK_TYPES,
} from "../model/constants";
import type {
  Banner,
  BannerFiles,
  BannerInput,
  BannerPlacement,
  LinkType,
  TargetModel,
} from "../model/types";
import { BannerPreview, BannerReadiness } from "./BannerAside";
import { TargetField } from "./TargetField";

/** Editable state of the form; the dates are dayjs, the target is "model:id". */
interface FormValues {
  name: string;
  placement: BannerPlacement;
  showOnSite: boolean;
  showOnIos: boolean;
  showOnAndroid: boolean;
  linkType: LinkType;
  target?: string;
  page: string;
  link: string;
  startsAt: Dayjs | null;
  endsAt: Dayjs | null;
}

const DATE_FORMAT = "DD.MM.YYYY HH:mm";
const API_FORMAT = "YYYY-MM-DDTHH:mm:ss";
const MAX_SIZE_MB = 5;

const initialValues = (banner: Banner | null): FormValues => ({
  name: banner?.nameRu || banner?.name || "",
  placement: banner?.placement ?? "site_home",
  showOnSite: banner?.showOnSite ?? true,
  showOnIos: banner?.showOnIos ?? true,
  showOnAndroid: banner?.showOnAndroid ?? true,
  linkType: banner?.linkType ?? "category",
  target: banner?.target ? `${banner.target.model}:${banner.target.id}` : undefined,
  page: banner?.page ?? "",
  link: banner?.link ?? "",
  startsAt: banner ? dayjs(banner.startsAt) : null,
  endsAt: banner?.endsAt ? dayjs(banner.endsAt) : null,
});

const hasAddress = (values: Partial<FormValues>) => {
  switch (values.linkType) {
    case "page":
      return !!values.page?.trim().startsWith("/");
    case "url":
      return /^https?:\/\/\S+$/.test(values.link?.trim() ?? "");
    default:
      return !!values.target;
  }
};

/**
 * Create / edit page of a banner: the form on the left, the preview and a checklist on the
 * right. Both images go together with the form (multipart).
 */
export function BannerForm({ banner }: { banner: Banner | null }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [files, setFiles] = useState<BannerFiles>({});

  const create = useCreateBanner();
  const update = useUpdateBanner();
  const setVisible = useSetBannerVisible();
  const remove = useDeleteBanner();

  const values = Form.useWatch((all: FormValues) => all, { form, preserve: true }) as
    Partial<FormValues> | undefined;
  const linkType = values?.linkType ?? banner?.linkType ?? "category";

  const desktopPreview = useMemo(
    () => (files.desktop ? URL.createObjectURL(files.desktop) : (banner?.desktopImage ?? null)),
    [files.desktop, banner?.desktopImage],
  );
  const mobilePreview = useMemo(
    () =>
      files.mobile
        ? URL.createObjectURL(files.mobile)
        : files.clearMobile
          ? null
          : (banner?.mobileImage ?? null),
    [files.mobile, files.clearMobile, banner?.mobileImage],
  );

  const readiness = [
    { key: "desktop", done: !!desktopPreview },
    {
      key: "channel",
      done: !!(values?.showOnSite || values?.showOnIos || values?.showOnAndroid),
    },
    { key: "address", done: hasAddress(values ?? {}) },
    { key: "start", done: !!values?.startsAt },
  ];

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const v = form.getFieldsValue(true) as FormValues;
    if (readiness.some((item) => !item.done)) {
      message.error(t("banners.readiness.incomplete"));
      return;
    }
    if (v.endsAt && v.startsAt && !v.endsAt.isAfter(v.startsAt)) {
      message.error(t("banners.endBeforeStart"));
      return;
    }
    let target: BannerInput["target"] = null;
    if (TARGET_LINK_TYPES.includes(v.linkType) && v.target) {
      const [model, id] = v.target.split(":");
      target = { model: model as TargetModel, id: Number(id) };
    }
    const input: BannerInput = {
      name: v.name,
      placement: v.placement,
      showOnSite: v.showOnSite,
      showOnIos: v.showOnIos,
      showOnAndroid: v.showOnAndroid,
      linkType: v.linkType,
      target,
      page: v.page,
      link: v.link,
      startsAt: (v.startsAt as Dayjs).format(API_FORMAT),
      endsAt: v.endsAt ? v.endsAt.format(API_FORMAT) : null,
      isVisible: banner?.isVisible ?? true,
    };
    const done = {
      onSuccess: (saved: Banner) => {
        message.success(t("banners.saved"));
        navigate(banner ? BANNERS_PATH : `${BANNERS_PATH}/${saved.id}`, { replace: !banner });
        setFiles({});
      },
      onError: (error: unknown) => message.error(getErrorMessage(error)),
    };
    if (banner) update.mutate({ banner, input, files }, done);
    else create.mutate({ input, files }, done);
  };

  const pick = (key: "desktop" | "mobile") => (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      message.error(t("common.imageTooBig", { size: MAX_SIZE_MB }));
      return;
    }
    setFiles((current) => ({
      ...current,
      [key]: file,
      ...(key === "mobile" ? { clearMobile: false } : {}),
    }));
  };

  const toggleArchive = () => {
    if (!banner) return;
    setVisible.mutate(
      { id: banner.id, isVisible: !banner.isVisible },
      {
        onSuccess: () => message.success(t("banners.saved")),
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );
  };

  const handleDelete = () => {
    if (!banner) return;
    remove.mutate(banner.id, {
      onSuccess: () => {
        message.success(t("banners.deleted"));
        navigate(BANNERS_PATH);
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  const required = (label: string) => (
    <>
      {label} <span className="text-red-600">*</span>
    </>
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link to={BANNERS_PATH} className="text-sm font-semibold">
            <LeftOutlined className="mr-1 text-xs" />
            {t("banners.back")}
          </Link>
          <h1 className="m-0 mt-1 flex items-center gap-3 text-2xl font-bold tracking-tight">
            {banner ? banner.name : t("banners.newTitle")}
            {banner && (
              <Tag
                color={STATUS_COLOR[banner.status]}
                variant="filled"
                className="m-0 font-semibold"
              >
                {t(`banners.status.${banner.status}`)}
              </Tag>
            )}
          </h1>
          {banner && <div className="font-mono text-xs text-slate-400">{banner.code}</div>}
        </div>
        <div className="flex flex-wrap gap-2">
          {banner && (
            <>
              <Popconfirm
                title={t("banners.deleteConfirm")}
                okText={t("common.delete")}
                okButtonProps={{ danger: true }}
                cancelText={t("common.cancel")}
                onConfirm={handleDelete}
              >
                <Button danger loading={remove.isPending}>
                  {t("common.delete")}
                </Button>
              </Popconfirm>
              <Button loading={setVisible.isPending} onClick={toggleArchive}>
                {t(banner.isVisible ? "banners.archive" : "banners.unarchive")}
              </Button>
            </>
          )}
          <Button
            type="primary"
            loading={create.isPending || update.isPending}
            onClick={() => void handleSave()}
          >
            {t("banners.save")}
          </Button>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={initialValues(banner)}
        className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Form.Item
                name="name"
                label={required(t("banners.name"))}
                extra={t("banners.nameHint")}
                rules={[{ required: true, whitespace: true, message: t("banners.required") }]}
              >
                <Input maxLength={255} />
              </Form.Item>
              <Form.Item name="placement" label={required(t("banners.placement"))}>
                <Select
                  options={PLACEMENTS.map((value) => ({
                    value,
                    label: t(`banners.placements.${value}`),
                  }))}
                />
              </Form.Item>
            </div>

            <Form.Item label={required(t("banners.channelsLabel"))}>
              <div className="flex flex-wrap gap-6">
                {(
                  [
                    ["showOnSite", t("banners.channels.site")],
                    ["showOnIos", "iOS"],
                    ["showOnAndroid", "Android"],
                  ] as const
                ).map(([name, label]) => (
                  <label key={name} className="flex items-center gap-2">
                    <Form.Item name={name} valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                    {label}
                  </label>
                ))}
              </div>
            </Form.Item>

            <Form.Item name="linkType" label={required(t("banners.linkType"))}>
              <Segmented<LinkType>
                block
                options={LINK_TYPES.map((value) => ({
                  value,
                  label: t(`banners.linkTypes.${value}`),
                }))}
                onChange={() => form.setFieldsValue({ target: undefined })}
              />
            </Form.Item>

            {TARGET_LINK_TYPES.includes(linkType) && (
              <Form.Item
                key={linkType}
                name="target"
                label={required(t("banners.address"))}
                rules={[{ required: true, message: t("banners.required") }]}
              >
                <TargetField linkType={linkType} current={banner?.target ?? null} />
              </Form.Item>
            )}
            {linkType === "page" && (
              <Form.Item
                name="page"
                label={required(t("banners.address"))}
                extra={t("banners.pageHint")}
                rules={[
                  { required: true, message: t("banners.required") },
                  { pattern: /^\//, message: t("banners.pageHint") },
                ]}
              >
                <Input className="font-mono" placeholder="/pro" />
              </Form.Item>
            )}
            {linkType === "url" && (
              <Form.Item
                name="link"
                label={required(t("banners.address"))}
                extra={t("banners.urlHint")}
                rules={[
                  { required: true, message: t("banners.required") },
                  { pattern: /^https?:\/\/\S+$/, message: t("banners.urlHint") },
                ]}
              >
                <Input className="font-mono" placeholder="https://" />
              </Form.Item>
            )}

            <div className="grid gap-x-4 sm:grid-cols-2">
              <Form.Item
                name="startsAt"
                label={required(t("banners.startsAt"))}
                rules={[{ required: true, message: t("banners.required") }]}
              >
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  format={DATE_FORMAT}
                  className="w-full"
                />
              </Form.Item>
              <Form.Item name="endsAt" label={t("banners.endsAt")} extra={t("banners.timezone")}>
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  format={DATE_FORMAT}
                  className="w-full"
                  allowClear
                />
              </Form.Item>
            </div>
          </div>

          <BannerContentCard
            images={
              <>
                <div className="flex gap-4">
                  <BannerImageDrop
                    label={t("banners.desktopImage")}
                    wide
                    url={banner?.desktopImage ?? null}
                    file={files.desktop}
                    onPick={pick("desktop")}
                  />
                  <BannerImageDrop
                    label={t("banners.mobileImage")}
                    url={files.clearMobile ? null : (banner?.mobileImage ?? null)}
                    file={files.mobile}
                    onPick={pick("mobile")}
                  />
                </div>
                {(files.mobile || (banner?.mobileImage && !files.clearMobile)) && (
                  <Button
                    type="link"
                    size="small"
                    className="px-0"
                    onClick={() =>
                      setFiles((current) => ({
                        ...current,
                        mobile: undefined,
                        clearMobile: !!banner?.mobileImage,
                      }))
                    }
                  >
                    {t("banners.removeMobile")}
                  </Button>
                )}
              </>
            }
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <BannerPreview desktopSrc={desktopPreview} mobileSrc={mobilePreview} />
          <BannerReadiness items={readiness} />
          <WidgetCard title={t("banners.note.title")}>
            <p className="m-0 text-xs text-slate-500">{t("banners.note.text")}</p>
          </WidgetCard>
        </div>
      </Form>
    </>
  );
}
