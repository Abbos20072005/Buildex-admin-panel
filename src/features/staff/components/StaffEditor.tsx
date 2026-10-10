import { CheckIcon, LockIcon } from "@/shared/icons";
import { App, Button, Form, Input, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { useEditorForm } from "@/shared/form";
import { clsx } from "@/shared/lib/clsx";
import { generatePassword } from "@/shared/lib/password";
import { EditorDrawer } from "@/shared/ui";
import { useCreateStaff, useDeleteStaff, useUpdateStaff } from "../hooks/queries";
import type { AccessLevel, StaffCreateInput, StaffMember } from "../model/types";

interface Props {
  /** null — a new staff member is being created */
  item: StaffMember | null;
  /** the signed-in account can't change its own level, block or delete itself */
  isSelf: boolean;
  onClose: () => void;
}

type FormValues = StaffCreateInput;

const LEVELS: AccessLevel[] = ["staff", "super_admin"];

/** The two access levels as selectable cards. */
function AccessLevelField({
  value,
  onChange,
  disabled,
}: {
  value?: AccessLevel;
  onChange?: (value: AccessLevel) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      {LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(level)}
          className={clsx(
            "flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
            value === level
              ? "border-brand bg-brand-soft"
              : "border-slate-200 bg-white hover:border-slate-300",
          )}
        >
          <span
            className={clsx(
              "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
              value === level ? "border-brand bg-brand text-white" : "border-slate-300",
            )}
          >
            {value === level && <CheckIcon className="text-[10px]" />}
          </span>
          <span>
            <span className="block text-sm font-semibold">{t(`staff.access.${level}`)}</span>
            <span className="block text-xs text-slate-500">{t(`staff.accessHint.${level}`)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/** "Parol yaratish": makes a password in the browser and shows it so it can be passed on. */
function PasswordField({
  value,
  onChange,
  clearable,
}: {
  value?: string;
  onChange?: (value: string) => void;
  /** a "Cancel" button that drops the generated password (editing: the password is optional) */
  clearable?: boolean;
}) {
  const { t } = useTranslation();
  const { message } = App.useApp();

  if (!value) {
    return (
      <Button icon={<LockIcon />} onClick={() => onChange?.(generatePassword())}>
        {t("staff.generatePassword")}
      </Button>
    );
  }
  return (
    <div className="flex gap-2">
      <Input
        readOnly
        value={value}
        className="font-mono"
        onFocus={(event) => event.target.select()}
      />
      <Button
        onClick={() =>
          void navigator.clipboard.writeText(value).then(() => message.success(t("staff.copied")))
        }
      >
        {t("staff.copy")}
      </Button>
      <Button onClick={() => onChange?.(generatePassword())}>{t("staff.regenerate")}</Button>
      {clearable && <Button onClick={() => onChange?.("")}>{t("common.cancel")}</Button>}
    </div>
  );
}

/** Drawer: a new staff member (login + generated password) or the card of an existing one. */
export function StaffEditor({ item, isSelf, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const guard = useEditorForm(form);

  const create = useCreateStaff();
  const update = useUpdateStaff();
  const remove = useDeleteStaff();
  const saving = create.isPending || update.isPending;

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
    } catch {
      return;
    }
    if (item) {
      // the login can't change; an empty password field leaves the password as it is
      const { username, ...input } = values;
      void username;
      update.mutate({ id: item.id, input }, done);
    } else create.mutate(values, done);
  };

  const handleDelete = () => {
    if (!item) return;
    remove.mutate(item.id, {
      onSuccess: () => {
        message.success(t("common.deleted"));
        guard.saved();
        onClose();
      },
      onError: guard.showError,
    });
  };

  const required = (label: string) => (
    <>
      {label} <span className="text-red-600">*</span>
    </>
  );

  return (
    <EditorDrawer
      size={460}
      title={item ? item.fullName : t("staff.newTitle")}
      onClose={() => guard.confirmClose(onClose)}
      onSave={() => void handleSave()}
      saving={saving}
      onDelete={item && !isSelf ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("staff.deleteConfirm")}
    >
      {!item && <p className="mt-0 mb-4 text-sm text-slate-500">{t("staff.newSubtitle")}</p>}
      <Form
        form={form}
        {...guard.formProps}
        disabled={saving}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          fullName: item?.fullName ?? "",
          position: item?.position ?? "",
          username: item?.username ?? "",
          accessLevel: item?.accessLevel ?? "staff",
          password: "",
          mustChangePassword: item?.mustChangePassword ?? true,
        }}
      >
        <Form.Item
          name="fullName"
          label={required(t("staff.fullName"))}
          rules={[{ required: true, whitespace: true, message: t("staff.required") }]}
        >
          <Input maxLength={150} autoFocus placeholder={t("staff.fullNamePlaceholder")} />
        </Form.Item>

        <Form.Item name="position" label={t("staff.position")}>
          <Input maxLength={150} placeholder={t("staff.positionPlaceholder")} />
        </Form.Item>

        <Form.Item
          name="username"
          label={item ? t("staff.columns.login") : required(t("staff.columns.login"))}
          extra={item ? undefined : t("staff.loginHint")}
          rules={
            item
              ? []
              : [
                  { required: true, whitespace: true, message: t("staff.required") },
                  { pattern: /^[a-zA-Z0-9.]+$/, message: t("staff.loginInvalid") },
                ]
          }
        >
          <Input
            disabled={!!item}
            autoCapitalize="none"
            spellCheck={false}
            className="font-mono"
            placeholder="kamola.e"
          />
        </Form.Item>

        <Form.Item
          name="accessLevel"
          label={t("staff.columns.access")}
          extra={isSelf ? t("staff.selfLevel") : undefined}
        >
          <AccessLevelField disabled={isSelf} />
        </Form.Item>

        <Form.Item
          name="password"
          label={item ? t("staff.newPassword") : required(t("staff.password"))}
          extra={item ? t("staff.newPasswordNote") : undefined}
          rules={item ? [] : [{ required: true, message: t("staff.passwordRequired") }]}
        >
          <PasswordField clearable={!!item} />
        </Form.Item>

        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div>
            <div className="text-sm font-semibold">{t("staff.mustChange")}</div>
            <div className="text-xs text-slate-500">{t("staff.mustChangeHint")}</div>
          </div>
          <Form.Item name="mustChangePassword" valuePropName="checked" noStyle>
            <Switch />
          </Form.Item>
        </div>
      </Form>
    </EditorDrawer>
  );
}
