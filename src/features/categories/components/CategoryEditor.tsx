import { CloseOutlined } from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Segmented,
  Select,
  Skeleton,
  Switch,
} from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { LANGUAGES, type LanguageCode } from "@/shared/i18n";
import { ImageField } from "@/shared/ui";
import { parentKey } from "../api/categories.mappers";
import {
  useCategoryAttributesQuery,
  useDeleteCategory,
  useParentOptionsQuery,
  useSaveCategory,
} from "../hooks/queries";
import { ROOT_PARENT, SLUG_PATTERN } from "../model/constants";
import type {
  CategoryAttributeRef,
  CategoryFiles,
  CategoryFormValues,
  CategoryItem,
  CategoryLevel,
  CategoryParentOption,
} from "../model/types";
import { AttributeSetField } from "./AttributeSetField";

/** "create" — a new category; an item — that category is edited */
export type CategoryEditorTarget = "create" | CategoryItem;

const META_TITLE_LIMIT = 60;
const META_DESCRIPTION_LIMIT = 160;

const emptyValues = (): CategoryFormValues => ({
  names: { uz: "", ru: "" },
  slug: "",
  code: "",
  metaTitle: { uz: "", ru: "" },
  metaDescription: { uz: "", ru: "" },
  showOnSite: true,
  showInApp: true,
  // a new category starts as a draft
  isActive: false,
  parent: ROOT_PARENT,
  attributes: [],
});

const toValues = (item: CategoryItem, attributes: CategoryAttributeRef[]): CategoryFormValues => ({
  names: { ...item.names },
  slug: item.slug,
  code: item.code ?? "",
  metaTitle: { ...item.metaTitle },
  metaDescription: { ...item.metaDescription },
  showOnSite: item.showOnSite,
  showInApp: item.showInApp,
  isActive: item.isActive,
  parent: parentKey(item.level, item.parentId),
  attributes,
});

/** "1:6" → { level: 1, id: 6 }; the top level has no parent */
function parseParent(key: string): { level: 1 | 2; id: number } | null {
  if (key === ROOT_PARENT) return null;
  const [level, id] = key.split(":").map(Number);
  return { level: level as 1 | 2, id };
}

/** Level of the category being created, from the chosen parent. */
const levelForParent = (key: string): CategoryLevel => {
  const parent = parseParent(key);
  return parent ? ((parent.level + 1) as CategoryLevel) : 1;
};

/** Text input with a "length / recommended limit" counter above it. */
function CountedInput({
  value = "",
  onChange,
  limit,
  multiline,
}: {
  value?: string;
  onChange?: (value: string) => void;
  limit: number;
  multiline?: boolean;
}) {
  return (
    <div className="relative">
      {multiline ? (
        <Input.TextArea
          value={value}
          maxLength={255}
          autoSize={{ minRows: 3, maxRows: 6 }}
          onChange={(event) => onChange?.(event.target.value)}
        />
      ) : (
        <Input value={value} maxLength={255} onChange={(event) => onChange?.(event.target.value)} />
      )}
      <div className="absolute -top-6 right-0 text-xs">
        <span className={value.length > limit ? "text-red-600" : "text-slate-400"}>
          {value.length} / {limit}
        </span>
      </div>
    </div>
  );
}

interface FormProps {
  initial: CategoryFormValues;
  /** attributes before editing, to know whether the set changed */
  initialAttributes: CategoryAttributeRef[];
  item: CategoryItem | null;
  parents: CategoryParentOption[];
  parentsLoading: boolean;
  onClose: () => void;
}

function CategoryForm({
  initial,
  initialAttributes,
  item,
  parents,
  parentsLoading,
  onClose,
}: FormProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<CategoryFormValues>();
  const [files, setFiles] = useState<CategoryFiles>({});
  const [seoLang, setSeoLang] = useState<LanguageCode>("uz");

  const save = useSaveCategory();
  const remove = useDeleteCategory();

  const parentValue = Form.useWatch("parent", form) ?? initial.parent;
  const level = item ? item.level : levelForParent(parentValue);
  const isActive = Form.useWatch("isActive", form) ?? initial.isActive;

  const options = useMemo(() => {
    const root = { value: ROOT_PARENT, label: t("categories.topLevel") };
    if (item?.level === 1) return [root];
    // the level of an existing category can't change — only a parent of the same level above
    const allowed = parents.filter((option) => !item || option.level === item.level - 1);
    // the list of parents loads slowly — the current one is known from the category itself
    if (item && item.parentId !== null) {
      const key = parentKey(item.level, item.parentId);
      if (!allowed.some((option) => option.key === key)) {
        allowed.unshift({
          key,
          level: (item.level - 1) as 1 | 2,
          id: item.parentId,
          label: item.parentPath,
        });
      }
    }
    const groups = ([1, 2] as const)
      .map((parentLevel) => ({
        label: t(`categories.level${parentLevel}`),
        options: allowed
          .filter((option) => option.level === parentLevel)
          .map((option) => ({ value: option.key, label: option.label })),
      }))
      .filter((group) => group.options.length > 0);
    return item ? groups : [root, ...groups];
  }, [parents, item, t]);

  // only top-level categories have required pictures (sub and item categories: optional image)
  const needsIcon = level === 1;
  const picturesMissing = needsIcon && !item && (!files.image || !files.icon);

  const submit = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    if (picturesMissing) {
      message.error(t("categories.imageRequired"));
      return;
    }
    const values = form.getFieldsValue(true) as CategoryFormValues;

    save.mutate(
      {
        level,
        id: item?.id ?? null,
        values,
        files,
        parentId: parseParent(values.parent)?.id ?? null,
        initialAttributes,
      },
      {
        onSuccess: () => {
          message.success(t("categories.saved"));
          onClose();
        },
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );
  };

  const handleDelete = () => {
    if (!item) return;
    remove.mutate(
      { level: item.level, id: item.id },
      {
        onSuccess: () => {
          message.success(t("categories.deleted"));
          onClose();
        },
        onError: (error) => message.error(getErrorMessage(error)),
      },
    );
  };

  const hasProducts = (item?.productsCount ?? 0) > 0;
  const required = (label: string) => (
    <>
      {label} <span className="text-red-600">*</span>
    </>
  );
  const requiredRule = [{ required: true, whitespace: true, message: t("categories.required") }];

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={initial}
        className="max-h-[calc(100vh-17rem)] overflow-y-auto px-5 py-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name={["names", "uz"]}
            label={required(t("categories.nameUz"))}
            rules={requiredRule}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item
            name={["names", "ru"]}
            label={required(t("categories.nameRu"))}
            rules={requiredRule}
          >
            <Input maxLength={255} placeholder="Название" />
          </Form.Item>
        </div>

        <Form.Item
          name="slug"
          label="Slug"
          extra={t("categories.slugHint")}
          rules={[{ pattern: SLUG_PATTERN, message: t("categories.slugInvalid") }]}
        >
          <Input addonBefore="/c/" maxLength={255} />
        </Form.Item>

        <Form.Item name="parent" label={t("categories.parent")}>
          <Select
            options={options}
            loading={parentsLoading}
            disabled={item?.level === 1}
            showSearch={{ optionFilterProp: "label" }}
          />
        </Form.Item>

        <Form.Item
          label={needsIcon && !item ? required(t("categories.image")) : t("categories.image")}
        >
          <ImageField
            url={item?.image ?? null}
            file={files.image}
            onPick={(image) => setFiles((current) => ({ ...current, image }))}
            hint={t("categories.imageHint", { size: 5 })}
          />
        </Form.Item>
        {needsIcon && (
          <Form.Item label={item ? t("categories.icon") : required(t("categories.icon"))}>
            <ImageField
              url={item?.icon ?? null}
              file={files.icon}
              onPick={(icon) => setFiles((current) => ({ ...current, icon }))}
              hint={t("categories.iconHint")}
            />
          </Form.Item>
        )}

        <Form.Item name="code" label={t("categories.code")}>
          <Input maxLength={50} className="max-w-60" />
        </Form.Item>

        {level === 3 && (
          <div className="mt-2 border-t border-slate-100 pt-4">
            <div className="mb-1 font-semibold">{t("categories.attributeSet")}</div>
            <p className="m-0 mb-3 text-xs text-slate-500">{t("categories.attributeSetHint")}</p>
            <Form.Item name="attributes" noStyle>
              <AttributeSetField />
            </Form.Item>
          </div>
        )}

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold">SEO</span>
            <Segmented
              value={seoLang}
              onChange={setSeoLang}
              options={LANGUAGES.map((language) => ({
                value: language.code,
                label: language.short,
              }))}
            />
          </div>
          {/* the fields of both languages stay in the form, only the picked ones are shown */}
          <Form.Item
            key={`title-${seoLang}`}
            name={["metaTitle", seoLang]}
            label="Meta title"
            className="mt-7"
          >
            <CountedInput limit={META_TITLE_LIMIT} />
          </Form.Item>
          <Form.Item
            key={`description-${seoLang}`}
            name={["metaDescription", seoLang]}
            label="Meta description"
            className="mt-7"
          >
            <CountedInput limit={META_DESCRIPTION_LIMIT} multiline />
          </Form.Item>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <div className="mb-3 font-semibold">{t("categories.visibility")}</div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>{t("categories.site")}</span>
              <Form.Item name="showOnSite" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </label>
            <label className="flex items-center justify-between">
              <span>{t("categories.app")}</span>
              <Form.Item name="showInApp" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
            </label>
          </div>
          <Form.Item name="isActive" label={t("categories.status")} className="mt-4 mb-1">
            <Select
              options={[
                { value: true, label: t("categories.active") },
                { value: false, label: t("categories.draft") },
              ]}
            />
          </Form.Item>
          {!isActive && <div className="text-xs text-slate-500">{t("categories.draftHint")}</div>}
        </div>
      </Form>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {item && (
            <Popconfirm
              title={t("categories.deleteConfirm")}
              okText={t("common.delete")}
              okButtonProps={{ danger: true }}
              cancelText={t("common.cancel")}
              disabled={hasProducts}
              onConfirm={handleDelete}
            >
              <Button danger disabled={hasProducts} loading={remove.isPending}>
                {t("common.delete")}
              </Button>
            </Popconfirm>
          )}
          {hasProducts && (
            <span className="text-xs leading-tight text-slate-500">
              {t("categories.hasProducts", { count: item?.productsCount })}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="primary" loading={save.isPending} onClick={() => void submit()}>
            {t("categories.save")}
          </Button>
        </div>
      </div>
    </>
  );
}

/** Side panel: create / edit one category of any level (like the attribute editor). */
export function CategoryEditor({
  target,
  onClose,
}: {
  target: CategoryEditorTarget;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const item = target === "create" ? null : target;

  const parents = useParentOptionsQuery(true);
  const attributes = useCategoryAttributesQuery(item?.level === 3 ? item.id : null);

  // the form opens without waiting for the (slow) list of parents
  const loading = item?.level === 3 && attributes.isPending;
  const error = attributes.error;

  return (
    <Card
      className="sticky top-20"
      styles={{ body: { padding: 0 } }}
      title={
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-bold">
              {item ? item.names.uz || item.name || item.names.ru : t("categories.newTitle")}
            </div>
            <div className="mt-0.5 text-xs font-normal text-slate-500">
              {item
                ? `${t("categories.entity")} · L${item.level}${item.parentPath ? ` · ${item.parentPath}` : ""}`
                : t("categories.newSubtitle")}
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
      {error ? (
        <div className="p-5">
          <Alert
            type="error"
            showIcon
            title={t("categories.loadError")}
            description={getErrorMessage(error)}
          />
        </div>
      ) : loading ? (
        <div className="p-5">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : (
        <CategoryForm
          key={item ? `${item.level}:${item.id}` : "create"}
          initial={item ? toValues(item, attributes.data ?? []) : emptyValues()}
          initialAttributes={attributes.data ?? []}
          item={item}
          parents={parents.data ?? []}
          parentsLoading={parents.isFetching}
          onClose={onClose}
        />
      )}
    </Card>
  );
}
