import { Alert, Skeleton } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "@/shared/api";
import { clsx } from "@/shared/lib/clsx";
import { formatDateTime } from "@/shared/lib/format";
import { useCustomerActivityQuery, useRoleHistoryQuery } from "../../hooks/queries";

/** One row of the tab: a line of the journal, or a role change from before the journal existed. */
interface Row {
  key: string;
  at: string;
  title: string;
  detail?: string;
  /** who and from where: "Aziz Karimov · Admin", "iOS" */
  by: string;
  tone: string;
}

/** The dot of a line: red for what stops the customer, green for what lets him in. */
const TONES: Record<string, string> = {
  blocked: "bg-red-500",
  deleted: "bg-red-500",
  logged_out_all: "bg-amber-500",
  phone_revealed: "bg-amber-500",
  unblocked: "bg-green-600",
  registered: "bg-green-600",
};

/**
 * What happened to the account: the journal of the backend (registration, logins, blocks, who
 * looked at the phone…). The journal starts at the deploy, so the role changes made before it
 * (role-history) are added below.
 */
export function LogTab({ customerId }: { customerId: number }) {
  const { t } = useTranslation();
  const activity = useCustomerActivityQuery(customerId);
  const history = useRoleHistoryQuery(customerId);

  const error = activity.error ?? history.error;
  if (error) return <Alert type="error" showIcon title={getErrorMessage(error)} />;
  if (!activity.data || !history.data) return <Skeleton active paragraph={{ rows: 3 }} />;

  const channelOf = (channel: string | null) => (channel ? t(`customers.channel.${channel}`) : "");
  const journal: Row[] = activity.data.map((item) => ({
    key: `a${item.id}`,
    at: item.createdAt,
    title: item.text,
    by: [item.actor, channelOf(item.channel)].filter(Boolean).join(" · "),
    tone: TONES[item.kind] ?? "bg-slate-300",
  }));

  // the earliest journal line: older role changes are not in the journal
  const journalStart = journal.at(-1)?.at;
  const older: Row[] = history.data
    .filter((entry) => !journalStart || dayjs(entry.createdAt).isBefore(journalStart))
    .map((entry) => ({
      key: `r${entry.id}`,
      at: entry.createdAt,
      title: t("customers.log.roleChanged", {
        from: t(`role.${entry.oldRole}`),
        to: t(`role.${entry.newRole}`),
      }),
      detail: entry.reason ? t("customers.log.reason", { reason: entry.reason }) : undefined,
      by: entry.changedBy,
      tone: "bg-slate-300",
    }));
  const rows = [...journal, ...older];

  return (
    <>
      <p className="mt-0 mb-3 text-xs text-slate-500">{t("customers.log.hint")}</p>
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-2">
        {rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">{t("customers.log.empty")}</div>
        ) : (
          <ul className="m-0 list-none p-0">
            {rows.map((row) => (
              <li
                key={row.key}
                className="flex gap-3 border-b border-slate-100 py-3 last:border-b-0"
              >
                <span className={clsx("mt-2 size-2 shrink-0 rounded-full", row.tone)} />
                <div>
                  <div className="text-sm font-semibold">{row.title}</div>
                  {row.detail && <div className="text-sm text-slate-600">{row.detail}</div>}
                  <div className="text-xs text-slate-500">
                    {[row.by, formatDateTime(row.at)].filter(Boolean).join(" · ")}
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
