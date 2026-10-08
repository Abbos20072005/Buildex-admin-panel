import { LockIcon } from "@/shared/icons";
import { Alert, Button, Form, Input } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/shared/api";
import { useAuth } from "../model/auth-context";

interface Values {
  oldPassword: string;
  newPassword: string;
  repeat: string;
}

/** First screen of an account with a temporary password: the old one and a new one, twice. */
export function ChangePasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const { changePassword, signOut } = useAuth();
  const [form] = Form.useForm<Values>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async ({ oldPassword, newPassword }: Values) => {
    setError(null);
    setSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword });
      onSuccess();
    } catch (err) {
      // field errors: {"old_password": [...]} or {"new_password": [...]}
      const body = err instanceof ApiError && err.status === 400 ? (err.body as object) : null;
      const record = (body ?? {}) as Record<string, unknown>;
      const fields = [
        ["old_password", "oldPassword"],
        ["new_password", "newPassword"],
      ] as const;
      const found = fields.flatMap(([apiName, name]) => {
        const messages = [record[apiName]].flat().filter((item) => typeof item === "string");
        return messages.length ? [{ name, errors: messages as string[] }] : [];
      });
      if (found.length) form.setFields(found);
      else setError(err instanceof Error ? err.message : t("login.serverError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[540px] rounded-3xl border border-slate-200 bg-white px-6 py-9 shadow-sm sm:px-12 sm:py-12">
      <h1 className="text-center text-[28px] font-bold sm:text-[32px]">
        {t("auth.changePassword.title")}
      </h1>
      <p className="mt-3 mb-9 text-center text-base text-slate-600">
        {t("auth.changePassword.subtitle")}
      </p>

      <Form
        form={form}
        layout="vertical"
        size="large"
        requiredMark
        onFinish={handleFinish}
        onValuesChange={() => error && setError(null)}
      >
        <Form.Item
          name="oldPassword"
          label={t("auth.changePassword.old")}
          rules={[{ required: true, message: t("login.required") }]}
        >
          <Input.Password
            autoFocus
            autoComplete="current-password"
            prefix={<LockIcon className="text-slate-400" />}
          />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label={t("auth.changePassword.new")}
          extra={t("auth.changePassword.hint")}
          rules={[
            { required: true, message: t("login.required") },
            { min: 8, message: t("auth.changePassword.short") },
          ]}
        >
          <Input.Password
            autoComplete="new-password"
            prefix={<LockIcon className="text-slate-400" />}
          />
        </Form.Item>
        <Form.Item
          name="repeat"
          label={t("auth.changePassword.repeat")}
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: t("login.required") },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue("newPassword") === value
                  ? Promise.resolve()
                  : Promise.reject(new Error(t("auth.changePassword.mismatch"))),
            }),
          ]}
        >
          <Input.Password
            autoComplete="new-password"
            prefix={<LockIcon className="text-slate-400" />}
          />
        </Form.Item>

        {error && <Alert type="error" title={error} showIcon className="mb-6" />}

        <Button type="primary" htmlType="submit" block loading={submitting} className="mt-2">
          {t("auth.changePassword.submit")}
        </Button>
        <Button type="link" block onClick={signOut} className="mt-2">
          {t("common.logout")}
        </Button>
      </Form>
    </div>
  );
}
