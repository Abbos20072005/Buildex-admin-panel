import { CloseOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Segmented,
  Select,
} from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { badgeColors } from "@/theme";
import { useCreateBadge, useDeleteBadge, useUpdateBadge } from "../hooks/queries";
import { DEFAULT_COLOR, RULE_FIELDS, RULE_OPERATORS } from "../model/constants";
import type { Badge, BadgeInput, BadgeKind, RuleField } from "../model/types";
import { BadgeChip } from "./BadgeChip";

interface Props {
  /** null — a new badge is being created */
  badge: Badge | null;
  onClose: () => void;
}

const emptyInput = (): BadgeInput => ({
  names: { uz: "", ru: "" },
  kind: "manual",
  ruleField: null,
  ruleOperator: null,
  ruleValue: null,
  color: DEFAULT_COLOR,
  // a new badge starts as a draft
  isActive: false,
});

const toInput = (badge: Badge): BadgeInput => ({
  names: { ...badge.names },
  kind: badge.kind,
  ruleField: badge.ruleField,
  ruleOperator: badge.ruleOperator,
  ruleValue: badge.ruleValue,
  color: badge.color,
  isActive: badge.isActive,
});

/** Colour swatches + a free picker. Works as a `Form.Item` control (`#rrggbb`). */
function ColorField({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const { t } = useTranslation();
  const current = (value ?? DEFAULT_COLOR).toLowerCase();
  const inPalette = badgeColors.some((color) => color.toLowerCase() === current);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badgeColors.map((color) => {
        const selected = color.toLowerCase() === current;
        return (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={selected}
            onClick={() => onChange?.(color)}
            style={{ backgroundColor: color }}
            className={clsx(
              "size-8 cursor-pointer rounded-lg border-2 border-white outline-offset-2 transition",
              selected ? "outline-2 outline-brand" : "outline-0 hover:scale-105",
            )}
          />
        );
      })}
      <ColorPicker
        value={current}
        disabledAlpha
        format="hex"
        onChange={(color) => onChange?.(color.toHexString().toLowerCase())}
      >
        <Button size="small" type={inPalette ? "default" : "primary"} ghost={!inPalette}>
          {t("badges.customColor")}
        </Button>
      </ColorPicker>
    </div>
  );
}

/**
 * Side panel: create / edit one badge. The form is remounted (`key`) for every badge, so it
 * always starts from the saved values.
 */
export function BadgeEditor({ badge, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<BadgeInput>();

  const create = useCreateBadge();
  const update = useUpdateBadge();
  const remove = useDeleteBadge();
  const saving = create.isPending || update.isPending;

  const kind = Form.useWatch("kind", form) ?? badge?.kind ?? "manual";
  const ruleField = Form.useWatch("ruleField", form) ?? badge?.ruleField ?? null;
  const color = Form.useWatch("color", form) ?? badge?.color ?? DEFAULT_COLOR;
  const names = Form.useWatch("names", form) ?? badge?.names;
  const isActive = Form.useWatch("isActive", form) ?? badge?.isActive ?? false;

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const input = form.getFieldsValue(true) as BadgeInput;
    const done = {
      onSuccess: () => {
        message.success(t("badges.saved"));
        onClose();
      },
      onError: (err: unknown) => message.error(getErrorMessage(err)),
    };
    if (badge) update.mutate({ id: badge.id, input }, done);
    else create.mutate(input, done);
  };

  const handleDelete = () => {
    if (!badge) return;
    remove.mutate(badge.id, {
      onSuccess: () => {
        message.success(t("badges.deleted"));
        onClose();
      },
      onError: (err) => message.error(getErrorMessage(err)),
    });
  };

  const required = (label: string) => (
    <>
      {label} <span className="text-red-600">*</span>
    </>
  );
  const requiredRule = [{ required: true, whitespace: true, message: t("badges.required") }];

  return (
    <Card
      className="sticky top-20"
      styles={{ body: { padding: 0 } }}
      title={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-bold">
              {badge ? badge.names.uz || badge.name : t("badges.newTitle")}
            </div>
            <div className="mt-0.5 text-xs font-normal text-slate-500">
              {badge
                ? t("badges.subtitle", { count: badge.productsCount })
                : t("badges.newSubtitle")}
            </div>
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            aria-label={t("common.cancel")}
          />
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={badge ? toInput(badge) : emptyInput()}
        className="max-h-[calc(100vh-17rem)] overflow-y-auto px-5 py-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name={["names", "uz"]}
            label={required(t("badges.nameUz"))}
            rules={requiredRule}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            name={["names", "ru"]}
            label={required(t("badges.nameRu"))}
            rules={requiredRule}
          >
            <Input maxLength={100} placeholder="Название" />
          </Form.Item>
        </div>

        <Form.Item name="kind" label={t("badges.kind")}>
          <Segmented<BadgeKind>
            block
            options={(["manual", "auto"] as const).map((value) => ({
              value,
              label: t(`badges.kinds.${value}`),
            }))}
          />
        </Form.Item>

        {kind === "auto" ? (
          <Form.Item label={required(t("badges.rule"))} extra={t("badges.ruleHint")}>
            <div className="grid grid-cols-[1fr_84px_96px] gap-2">
              <Form.Item
                name="ruleField"
                noStyle
                rules={[{ required: true, message: t("badges.required") }]}
              >
                <Select<RuleField>
                  placeholder={t("badges.ruleField")}
                  options={RULE_FIELDS.map((value) => ({
                    value,
                    label: t(`badges.ruleFields.${value}`),
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="ruleOperator"
                noStyle
                rules={[{ required: true, message: t("badges.required") }]}
              >
                <Select
                  placeholder="＞"
                  options={RULE_OPERATORS.map(({ value, symbol }) => ({ value, label: symbol }))}
                />
              </Form.Item>
              <Form.Item
                name="ruleValue"
                noStyle
                rules={[{ required: true, type: "number", message: t("badges.required") }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  max={ruleField === "discount" ? 100 : undefined}
                  precision={0}
                />
              </Form.Item>
            </div>
          </Form.Item>
        ) : null}

        <Form.Item name="color" label={t("badges.color")}>
          <ColorField />
        </Form.Item>

        <Form.Item label={t("badges.preview")}>
          <div className="w-52 rounded-xl border border-slate-200 bg-white p-2.5">
            <div className="relative grid aspect-[4/3] place-items-center rounded-lg bg-slate-100">
              <span className="absolute top-2 left-2">
                <BadgeChip name={names?.uz || names?.ru || t("badges.previewName")} color={color} />
              </span>
            </div>
            <div className="mt-2.5 h-2.5 w-4/5 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-2/5 rounded bg-slate-300" />
          </div>
        </Form.Item>

        <Form.Item name="isActive" label={t("badges.status")} className="mb-1">
          <Select
            options={[
              { value: true, label: t("badges.active") },
              { value: false, label: t("badges.draft") },
            ]}
          />
        </Form.Item>
        {!isActive && <div className="text-xs text-slate-500">{t("badges.draftHint")}</div>}
      </Form>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {badge && (
            <Popconfirm
              title={t("badges.deleteConfirm")}
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
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="primary" loading={saving} onClick={() => void handleSave()}>
            {t("badges.save")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
