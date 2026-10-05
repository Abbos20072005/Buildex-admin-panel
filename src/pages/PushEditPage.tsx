import { Alert, Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { PUSH_PATH, PushForm, usePushQuery } from "@/features/push";
import { getErrorMessage } from "@/shared/api";

/** /content/push/new — a new notification; /content/push/:id — an existing one. */
export function PushEditPage() {
  const { t } = useTranslation();
  const raw = useParams().id;
  const id = raw === undefined ? null : Number(raw);
  const invalid = id !== null && (!Number.isInteger(id) || id <= 0);

  const push = usePushQuery(invalid ? null : id);

  if (invalid) return <Navigate to={PUSH_PATH} replace />;
  if (id === null) return <PushForm push={null} />;
  if (push.error) {
    return (
      <Alert
        type="error"
        showIcon
        title={t("push.loadError")}
        description={getErrorMessage(push.error)}
      />
    );
  }
  if (!push.data) return <Skeleton active paragraph={{ rows: 10 }} />;
  // key: the form restarts from the saved values after a save
  return <PushForm key={`${push.data.id}-${push.data.updatedAt}`} push={push.data} />;
}
