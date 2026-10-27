import { Alert, Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { formatDateTime } from "@/shared/lib/format";
import { useRoleHistoryQuery } from "../../hooks/queries";

/** What changed on the account. Today only the role changes are recorded by the backend. */
export function LogTab({ customerId }: { customerId: number }) {
  const { t } = useTranslation();
  const history = useRoleHistoryQuery(customerId);

  if (history.error) {
    return <Alert type="error" showIcon title={getErrorMessage(history.error)} />;
  }
  if (history.isPending) return <Skeleton active paragraph={{ rows: 3 }} />;

  return (
    <>
      <p className="mt-0 mb-3 text-xs text-slate-500">{t("customers.log.soon")}</p>
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-2">
        {history.data.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">{t("customers.log.empty")}</div>
        ) : (
          <ul className="m-0 list-none p-0">
            {history.data.map((entry) => (
              <li
                key={entry.id}
                className="flex gap-3 border-b border-slate-100 py-3 last:border-b-0"
              >
                <span className="mt-2 size-2 shrink-0 rounded-full bg-slate-300" />
                <div>
                  <div className="text-sm font-semibold">
                    {t("customers.log.roleChanged", {
                      from: t(`role.${entry.oldRole}`),
                      to: t(`role.${entry.newRole}`),
                    })}
                  </div>
                  {entry.reason && (
                    <div className="text-sm text-slate-600">
                      {t("customers.log.reason", { reason: entry.reason })}
                    </div>
                  )}
                  <div className="text-xs text-slate-500">
                    {entry.changedBy} · {formatDateTime(entry.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
