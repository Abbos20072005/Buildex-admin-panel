import { InfoCircleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Tooltip } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiError } from "@/shared/api";
import { useAuth } from "../model/auth-context";
import type { LoginCredentials } from "../model/types";

function loginErrorKey(error: unknown): string {
  const status = error instanceof ApiError ? error.status : -1;
  if (status === 0) return "login.network";
  if (status === 400 || status === 401) return "login.invalid";
  if (status === 403) return "login.forbidden";
  return "login.serverError";
}

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [form] = Form.useForm<LoginCredentials>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: LoginCredentials) => {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(values);
      onSuccess();
    } catch (err) {
      setError(t(loginErrorKey(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const required = [{ required: true, whitespace: true, message: t("login.required") }];

  return (
    <div className="w-full max-w-[540px] rounded-3xl border border-slate-200 bg-white px-6 py-9 shadow-sm sm:px-12 sm:py-12">
      <h1 className="text-center text-[28px] font-bold sm:text-[32px]">{t("login.title")}</h1>
      <p className="mt-3 mb-9 text-center text-base text-slate-600 sm:text-[17px]">
        {t("login.subtitle")}
      </p>

      <Form
        form={form}
        layout="vertical"
        size="large"
        requiredMark
        onFinish={handleFinish}
        onValuesChange={() => error && setError(null)}
        className="[&_.ant-form-item-label>label]:text-[15px] [&_.ant-form-item-label>label]:font-semibold"
      >
        <Form.Item name="username" label={t("login.login")} rules={required}>
          <Input
            autoFocus
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={t("login.login")}
            prefix={<UserOutlined className="text-slate-400" />}
            suffix={
              <Tooltip title={t("login.loginHint")}>
                <InfoCircleOutlined className="text-slate-400" />
              </Tooltip>
            }
            className="h-14"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={t("login.password")}
          rules={[{ required: true, message: t("login.required") }]}
        >
          <Input.Password
            autoComplete="current-password"
            placeholder="••••••••"
            prefix={<LockOutlined className="text-slate-400" />}
            className="h-14"
          />
        </Form.Item>

        {error && <Alert type="error" title={error} showIcon className="mb-6" />}

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={submitting}
          className="mt-2 h-14 text-base font-semibold"
        >
          {t("login.submit")}
        </Button>
      </Form>
    </div>
  );
}
