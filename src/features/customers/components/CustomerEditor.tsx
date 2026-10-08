import { Alert, App, Form, Input, Select, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { useEditorForm } from "@/shared/form";
import { formatDateTime, formatMoney } from "@/shared/lib/format";
import { EditorDrawer, InitialsAvatar } from "@/shared/ui";
import {
  useCreateCustomer,
  useCustomerQuery,
  useDeleteCustomer,
  useUpdateCustomer,
} from "../hooks/queries";
import { CUSTOMER_ROLES, type CustomerInput } from "../model/types";

interface Props {
  /** "new" — create; a number — edit that customer */
  id: number | "new";
  onClose: () => void;
}

const required = (label: string) => (
  <>
    {label} <span className="text-red-600">*</span>
  </>
);

/** Customer card: the editable profile fields, and the read-only figures and addresses. */
export function CustomerEditor({ id, onClose }: Props) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm<CustomerInput>();
  const guard = useEditorForm(form);

  const editing = id !== "new";
  const detail = useCustomerQuery(editing ? id : null);
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const remove = useDeleteCustomer();
  const item = detail.data;

  const done = {
    onSuccess: () => {
      message.success(t("common.saved"));
      guard.saved();
      onClose();
    },
    onError: guard.showError,
  };

  const handleSave = async () => {
    let input: CustomerInput;
    try {
      input = await form.validateFields();
    } catch {
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
        guard.saved();
        onClose();
      },
      onError: (error) => message.error(getErrorMessage(error)),
    });
  };

  return (
    <EditorDrawer
      size={560}
      title={item ? item.fullName || item.phone : t("customers.newTitle")}
      onClose={() => guard.confirmClose(onClose)}
      onSave={() => void handleSave()}
      saving={create.isPending || update.isPending}
      loading={editing && detail.isPending}
      onDelete={editing ? handleDelete : undefined}
      deleting={remove.isPending}
      deleteConfirm={t("customers.deleteConfirm")}
    >
      {detail.error ? (
        <Alert type="error" showIcon title={getErrorMessage(detail.error)} />
      ) : (
        <>
          {item && (
            <div className="mb-5 flex items-center gap-4 rounded-xl bg-surface-alt p-4">
              <InitialsAvatar name={item.fullName || item.phone} src={item.avatar} size={56} />
              <dl className="m-0 grid flex-1 grid-cols-3 gap-3 text-xs text-slate-500">
                <div>
                  <dt>{t("customers.columns.orders")}</dt>
                  <dd className="m-0 mt-0.5 text-sm font-bold text-slate-900">
                    {item.ordersCount}
                  </dd>
                </div>
                <div>
                  <dt>{t("customers.columns.purchase")}</dt>
                  <dd className="m-0 mt-0.5 text-sm font-bold text-slate-900">
                    {formatMoney(item.totalPurchase, t("common.sum"))}
                  </dd>
                </div>
                <div>
                  <dt>{t("customers.columns.lastLogin")}</dt>
                  <dd className="m-0 mt-0.5 text-sm font-bold text-slate-900">
                    {formatDateTime(item.lastLogin)}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <Form
            form={form}
            {...guard.formProps}
            disabled={create.isPending || update.isPending}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              fullName: item?.fullName ?? "",
              phone: item?.phone ?? "",
              email: item?.email ?? "",
              role: item?.role ?? "user",
              verified: item?.verified ?? false,
              isBlocked: item?.isBlocked ?? false,
            }}
          >
            <Form.Item name="fullName" label={t("customers.fields.fullName")}>
              <Input maxLength={150} />
            </Form.Item>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Form.Item
                name="phone"
                label={required(t("customers.fields.phone"))}
                rules={[
                  { required: true, whitespace: true, message: t("customers.required") },
                  { pattern: /^\+?\d{9,14}$/, message: t("customers.phoneInvalid") },
                ]}
              >
                <Input maxLength={14} placeholder="+998901234567" className="font-mono" />
              </Form.Item>
              <Form.Item
                name="email"
                label={t("customers.fields.email")}
                rules={[{ type: "email", message: t("customers.emailInvalid") }]}
              >
                <Input maxLength={254} />
              </Form.Item>
            </div>
            <Form.Item name="role" label={t("customers.fields.role")}>
              <Select
                options={CUSTOMER_ROLES.map((value) => ({ value, label: t(`role.${value}`) }))}
              />
            </Form.Item>
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block font-semibold">{t("customers.fields.verified")}</span>
                  <span className="text-xs text-slate-500">{t("customers.verifiedHint")}</span>
                </span>
                <Form.Item name="verified" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </label>
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block font-semibold">{t("customers.fields.blocked")}</span>
                  <span className="text-xs text-slate-500">{t("customers.blockedHint")}</span>
                </span>
                <Form.Item name="isBlocked" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </label>
            </div>
          </Form>

          {item && (
            <div className="mt-6">
              <div className="mb-2 text-sm font-bold">
                {t("customers.addresses")}{" "}
                <span className="text-slate-400">{item.addresses.length}</span>
              </div>
              {item.addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400">
                  {t("customers.noAddresses")}
                </div>
              ) : (
                <ul className="m-0 list-none divide-y divide-slate-100 rounded-xl border border-slate-200 p-0">
                  {item.addresses.map((address) => (
                    <li key={address.id} className="px-4 py-2.5">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {address.name}
                        {address.isDefault && (
                          <span className="rounded bg-brand-soft px-1.5 text-[11px] text-brand">
                            {t("customers.defaultAddress")}
                          </span>
                        )}
                      </div>
                      {address.locationName && (
                        <div className="text-xs text-slate-500">{address.locationName}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </EditorDrawer>
  );
}
