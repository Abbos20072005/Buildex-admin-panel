import { Alert, App, Form, Input, InputNumber, Segmented, Select, Switch } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useEditorForm } from "@/shared/form";
import { EditorDrawer, ImageField } from "@/shared/ui";
import { defaultSchedule, scheduleError } from "../lib/schedule";
import { useCreateStore, useDeleteStore, useUpdateStore } from "../hooks/queries";
import { STORE_TYPES, type Store, type StoreFiles, type StoreInput } from "../model/types";
import { ScheduleField } from "./ScheduleField";
import { StoreMapPicker } from "./StoreMapPicker";

interface Props {
  /** null — a new store */
  store: Store | null;
  onClose: () => void;
}

const LANGS = ["uz", "ru"] as const;
type Lang = (typeof LANGS)[number];

/** API field → form field, where the names differ. */
const FIELD_MAP = {
  name_uz: ["names", "uz"],
  name_ru: ["names", "ru"],
  address_uz: ["addresses", "uz"],
  address_ru: ["addresses", "ru"],
  landmark_uz: ["landmarks", "uz"],
  landmark_ru: ["landmarks", "ru"],
  description_uz: ["descriptions", "uz"],
  description_ru: ["descriptions", "ru"],
  phone_number: "phone",
  branch_type: "type",
  is_active: "isActive",
} as const;

const emptyInput = (): StoreInput => ({
  names: { uz: "", ru: "" },
  addresses: { uz: "", ru: "" },
  landmarks: { uz: "", ru: "" },
  descriptions: { uz: "", ru: "" },
  type: 1,
  latitude: null,
  longitude: null,
  schedule: defaultSchedule(),
  phone: "",
  isActive: true,
  code: "",
});

/** The phone is edited as the 9 digits after +998. */
const nationalDigits = (phone: string) => phone.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);

const toInput = (store: Store): StoreInput => ({
  names: { ...store.names },
  addresses: { ...store.addresses },
  landmarks: { ...store.landmarks },
  descriptions: { ...store.descriptions },
  type: store.type,
  latitude: store.latitude,
  longitude: store.longitude,
  schedule: store.schedule.map((item) => ({ ...item })),
  phone: nationalDigits(store.phone),
  isActive: store.isActive,
  code: store.code,
});

/**
 * A store: the texts in Uzbek / Russian, the phone, one picture, the point on the Yandex map,
 * the opening hours of the week and the state. A store with orders can't be deleted, only
 * switched off.
 */
export function StoreEditor({ store, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<StoreInput>();
  const guard = useEditorForm(form, FIELD_MAP);
  const [lang, setLang] = useState<Lang>("uz");
  const [files, setFiles] = useState<StoreFiles>({});

  const create = useCreateStore();
  const update = useUpdateStore();
  const remove = useDeleteStore();
  const saving = create.isPending || update.isPending;

  const latitude = Form.useWatch("latitude", form) ?? store?.latitude ?? null;
  const longitude = Form.useWatch("longitude", form) ?? store?.longitude ?? null;
  const hasOrders = (store?.ordersCount ?? 0) > 0;

  const required = [{ required: true, whitespace: true, message: t("stores.required") }];

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const input = form.getFieldsValue(true) as StoreInput;
    const done = {
      onSuccess: () => {
        message.success(t("common.saved"));
        guard.saved();
        onClose();
      },
      onError: guard.showError,
    };
    if (store) update.mutate({ id: store.id, input, files }, done);
    else create.mutate({ input, files }, done);
  };

  const handleDelete = () => {
    if (!store) return;
    remove.mutate(store.id, {
      onSuccess: () => {
        message.success(t("common.deleted"));
        guard.saved();
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  const pickPoint = (lat: number, lng: number) => {
    form.setFieldsValue({ latitude: lat, longitude: lng });
    guard.markDirty();
    void form.validateFields(["latitude", "longitude"]).catch(() => undefined);
  };

  return (
    <EditorDrawer
      size={720}
      title={store ? store.name : t("stores.newTitle")}
      onClose={() => guard.confirmClose(onClose)}
      onSave={() => void handleSave()}
      saving={saving}
      // a store with orders is never deleted: it is switched off with the "active" switch
      onDelete={store && !hasOrders ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("stores.deleteConfirm")}
    >
      {hasOrders && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          title={t("stores.hasOrders", { count: store?.ordersCount })}
        />
      )}
      <Form
        form={form}
        {...guard.formProps}
        disabled={saving}
        layout="vertical"
        requiredMark={false}
        initialValues={store ? toInput(store) : emptyInput()}
      >
        <div className="mb-3 flex justify-end">
          <Segmented<Lang>
            value={lang}
            onChange={setLang}
            options={LANGS.map((code) => ({ value: code, label: code.toUpperCase() }))}
          />
        </div>
        {/* both languages stay in the form (so a hidden empty one still blocks the save) */}
        {LANGS.map((code) => (
          <div key={code} className={code === lang ? undefined : "hidden"}>
            <Form.Item
              name={["names", code]}
              label={`${t("stores.name")} (${code.toUpperCase()})`}
              rules={required}
            >
              <Input maxLength={255} />
            </Form.Item>
            <Form.Item
              name={["addresses", code]}
              label={`${t("stores.address")} (${code.toUpperCase()})`}
              rules={required}
            >
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} maxLength={500} />
            </Form.Item>
            <Form.Item
              name={["landmarks", code]}
              label={`${t("stores.landmark")} (${code.toUpperCase()})`}
            >
              <Input maxLength={255} placeholder={t("stores.landmarkHint")} />
            </Form.Item>
            <Form.Item
              name={["descriptions", code]}
              label={`${t("stores.description")} (${code.toUpperCase()})`}
            >
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>
          </div>
        ))}

        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="phone"
            label={t("stores.phone")}
            normalize={(value: string) => nationalDigits(value)}
            rules={[{ pattern: /^\d{9}$/, message: t("stores.phoneInvalid") }]}
          >
            <Input
              addonBefore="+998"
              maxLength={9}
              placeholder="90 123 45 67"
              className="font-mono"
            />
          </Form.Item>
          <Form.Item name="type" label={t("stores.type")}>
            <Select
              options={STORE_TYPES.map((value) => ({ value, label: t(`stores.types.${value}`) }))}
            />
          </Form.Item>
        </div>

        <Form.Item label={t("stores.image")}>
          <ImageField
            url={store?.image ?? null}
            file={files.image}
            onPick={(image) => {
              setFiles({ image });
              guard.markDirty();
            }}
            hint={t("stores.imageHint")}
          />
        </Form.Item>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <div className="mb-1 font-semibold">{t("stores.location")}</div>
          <p className="m-0 mb-3 text-xs text-slate-500">{t("stores.locationHint")}</p>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="latitude"
              label={t("stores.latitude")}
              rules={[{ required: true, type: "number", message: t("stores.required") }]}
            >
              <InputNumber className="w-full" min={-90} max={90} step={0.0001} controls={false} />
            </Form.Item>
            <Form.Item
              name="longitude"
              label={t("stores.longitude")}
              rules={[{ required: true, type: "number", message: t("stores.required") }]}
            >
              <InputNumber className="w-full" min={-180} max={180} step={0.0001} controls={false} />
            </Form.Item>
          </div>
          <StoreMapPicker latitude={latitude} longitude={longitude} onPick={pickPoint} />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="mb-2 font-semibold">{t("stores.schedule")}</div>
          <Form.Item
            name="schedule"
            rules={[
              {
                validator: async (_, days: StoreInput["schedule"] | undefined) => {
                  const problem = scheduleError(days);
                  if (problem) throw new Error(t(`stores.scheduleError.${problem}`));
                },
              },
            ]}
          >
            <ScheduleField />
          </Form.Item>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <Form.Item name="code" label={t("stores.code")} extra={t("stores.codeHint")}>
            <Input maxLength={100} className="max-w-72 font-mono" />
          </Form.Item>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-semibold">{t("stores.activeLabel")}</span>
              <span className="block text-xs text-slate-500">{t("stores.activeHint")}</span>
            </span>
            <Form.Item name="isActive" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </label>
        </div>
      </Form>
    </EditorDrawer>
  );
}
