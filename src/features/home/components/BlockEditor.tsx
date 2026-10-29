import { CloseIcon, PlusIcon } from "@/shared/icons";
import { App, Button, Form, Input, InputNumber, Select, Switch } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { reportInvalid, useEditorForm } from "@/shared/form";
import { EditorDrawer } from "@/shared/ui";
import { useCreateBlock, useSourceOptions, useUpdateBlock } from "../hooks/queries";
import { SLIDER_PLACEMENTS } from "../model/constants";
import type { BlockDraft } from "../model/preview";
import type { BlockType, HomeBlock, HomeBlockInput, PageLink } from "../model/types";

interface Props {
  /** null — a new block of `type` is being created */
  block: HomeBlock | null;
  type: BlockType;
  onClose: () => void;
  /** every edit, before it is saved — the page shows it in the preview; null on close */
  onDraft: (draft: BlockDraft | null) => void;
}

interface FormValues {
  titleRu: string;
  titleUz: string;
  titleEn: string;
  showOnSite: boolean;
  showInApp: boolean;
  isVisible: boolean;
  bannerPlacement: string;
  bannerId: number | null;
  badgeId: number | null;
  /** "main" — the main sale */
  sale: number | "main";
  days: number | null;
  pages: PageLink[];
}

const emptyLink = (): PageLink => ({ titleRu: "", titleUz: "", titleEn: "", path: "" });

/** One block: titles, channels, and the source its type needs (a banner, a tag, a sale, days…). */
export function BlockEditor({ block, type, onClose, onDraft }: Props) {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();

  // the edits as they are typed (watching the whole form), shown in the page preview
  const values = Form.useWatch([], form) as Partial<FormValues> | undefined;
  const uz = i18n.language.startsWith("uz");
  useEffect(() => {
    if (!values) return;
    const ru = values.titleRu?.trim() ?? "";
    const uzTitle = values.titleUz?.trim() ?? "";
    onDraft({
      id: block?.id ?? null,
      type,
      title: (uz ? uzTitle || ru : ru || uzTitle) || block?.title || "",
      showOnSite: values.showOnSite ?? true,
      showInApp: values.showInApp ?? true,
      isVisible: values.isVisible ?? true,
      bannerPlacement: values.bannerPlacement ?? "",
      bannerId: values.bannerId ?? null,
      badgeId: values.badgeId ?? null,
      saleId: values.sale === undefined || values.sale === "main" ? null : values.sale,
      days: values.days ?? null,
      pages: values.pages ?? [],
    });
  }, [values, block, type, uz, onDraft]);
  useEffect(() => () => onDraft(null), [onDraft]);
  const guard = useEditorForm(form, {
    title_ru: "titleRu",
    title_uz: "titleUz",
    title_en: "titleEn",
    show_in_app: "showInApp",
    show_on_site: "showOnSite",
    banner_placement: "bannerPlacement",
    banner: "bannerId",
    badge: "badgeId",
    sale: "sale",
  });

  const create = useCreateBlock();
  const update = useUpdateBlock();
  const saving = create.isPending || update.isPending;

  const banners = useSourceOptions("banners", type === "banner");
  const badges = useSourceOptions("badges", type === "badge_products");
  const sales = useSourceOptions("sales", type === "sale_products");

  const done = {
    onSuccess: () => {
      message.success(t("common.saved"));
      guard.saved();
      onClose();
    },
    onError: guard.showError,
  };

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch (error) {
      reportInvalid(error, message);
      return;
    }
    if (!values.showOnSite && !values.showInApp) {
      message.error(t("home.channelRequired"));
      return;
    }
    const input: HomeBlockInput = {
      type,
      titleRu: values.titleRu,
      titleUz: values.titleUz ?? "",
      titleEn: values.titleEn ?? "",
      showOnSite: values.showOnSite,
      showInApp: values.showInApp,
      isVisible: values.isVisible,
      bannerPlacement: values.bannerPlacement,
      bannerId: values.bannerId,
      badgeId: values.badgeId,
      saleId: values.sale === "main" ? null : values.sale,
      days: values.days,
      pages: values.pages ?? [],
    };
    if (block) update.mutate({ id: block.id, input }, done);
    else create.mutate(input, done);
  };

  const required = (label: string) => (
    <>
      {label} <span className="text-red-600">*</span>
    </>
  );
  const requiredRule = [{ required: true, message: t("home.required") }];

  return (
    <EditorDrawer
      title={block ? block.title : t("home.newBlock", { type: t(`home.types.${type}`) })}
      onClose={() => guard.confirmClose(onClose)}
      onSave={() => void handleSave()}
      saving={saving}
    >
      <p className="mt-0 mb-4 text-xs text-slate-500">{t(`home.typeHints.${type}`)}</p>
      <Form
        form={form}
        {...guard.formProps}
        disabled={saving}
        layout="vertical"
        initialValues={{
          titleRu: block?.titleRu ?? "",
          titleUz: block?.titleUz ?? "",
          titleEn: block?.titleEn ?? "",
          showOnSite: block?.showOnSite ?? true,
          showInApp: block?.showInApp ?? true,
          isVisible: block?.isVisible ?? true,
          bannerPlacement: block?.bannerPlacement || "home_bottom",
          bannerId: block?.banner?.id ?? null,
          badgeId: block?.badge?.id ?? null,
          sale: block?.sale?.id ?? "main",
          days: block?.days ?? 7,
          pages: block?.pages.length ? block.pages : [emptyLink()],
        }}
      >
        <Form.Item
          name="titleRu"
          label={required(t("home.titleRu"))}
          rules={[{ required: true, whitespace: true, message: t("home.required") }]}
        >
          <Input maxLength={255} autoFocus />
        </Form.Item>
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="titleUz" label={t("home.titleUz")}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="titleEn" label={t("home.titleEn")}>
            <Input maxLength={255} />
          </Form.Item>
        </div>

        {type === "slider" && (
          <Form.Item name="bannerPlacement" label={required(t("home.sliderSource"))}>
            <Select
              options={SLIDER_PLACEMENTS.map((value) => ({
                value,
                label: t(`home.sliderPlacements.${value}`),
              }))}
            />
          </Form.Item>
        )}

        {type === "banner" && (
          <Form.Item name="bannerId" label={required(t("home.banner"))} rules={requiredRule}>
            <Select
              showSearch={{ optionFilterProp: "label" }}
              loading={banners.isFetching}
              placeholder={t("home.chooseBanner")}
              options={(banners.data ?? []).map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
        )}

        {type === "badge_products" && (
          <Form.Item name="badgeId" label={required(t("home.badge"))} rules={requiredRule}>
            <Select
              showSearch={{ optionFilterProp: "label" }}
              loading={badges.isFetching}
              placeholder={t("home.chooseBadge")}
              options={(badges.data ?? []).map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
        )}

        {type === "sale_products" && (
          <Form.Item name="sale" label={t("home.sale")}>
            <Select<number | "main">
              showSearch={{ optionFilterProp: "label" }}
              loading={sales.isFetching}
              options={[
                { value: "main", label: t("home.mainSale") },
                ...(sales.data ?? []).map((item) => ({ value: item.id, label: item.name })),
              ]}
            />
          </Form.Item>
        )}

        {type === "new_products" && (
          <Form.Item
            name="days"
            label={required(t("home.days"))}
            extra={t("home.daysHint")}
            rules={[{ required: true, type: "number", min: 1, message: t("home.required") }]}
          >
            <InputNumber min={1} max={365} className="w-40" />
          </Form.Item>
        )}

        {type === "pages" && (
          <Form.List name="pages">
            {(fields, { add, remove }) => (
              <div className="mb-6 space-y-3">
                <div className="text-sm font-semibold">{required(t("home.pages"))}</div>
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className="grid grid-cols-[1fr_1fr_auto] items-start gap-2 rounded-xl border border-slate-200 p-3"
                  >
                    <Form.Item
                      name={[field.name, "titleRu"]}
                      label={t("home.titleRu")}
                      className="mb-0"
                      rules={[{ required: true, whitespace: true, message: t("home.required") }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "titleUz"]}
                      label={t("home.titleUz")}
                      className="mb-0"
                    >
                      <Input />
                    </Form.Item>
                    <Button
                      type="text"
                      className="mt-7"
                      icon={<CloseIcon />}
                      aria-label={t("common.delete")}
                      onClick={() => remove(field.name)}
                    />
                    <Form.Item
                      name={[field.name, "path"]}
                      label={t("home.path")}
                      className="col-span-2 mb-0"
                      rules={[
                        { required: true, message: t("home.required") },
                        { pattern: /^\//, message: t("home.pathInvalid") },
                      ]}
                    >
                      <Input placeholder="/delivery" className="font-mono" />
                    </Form.Item>
                  </div>
                ))}
                <Button icon={<PlusIcon />} onClick={() => add(emptyLink())}>
                  {t("home.addPage")}
                </Button>
              </div>
            )}
          </Form.List>
        )}

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">{t("home.channels.site")}</span>
            <Form.Item name="showOnSite" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">{t("home.channels.app")}</span>
            <Form.Item name="showInApp" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-semibold">{t("home.visible")}</span>
              <span className="block text-xs text-slate-500">{t("home.visibleHint")}</span>
            </span>
            <Form.Item name="isVisible" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </label>
        </div>
      </Form>
    </EditorDrawer>
  );
}
