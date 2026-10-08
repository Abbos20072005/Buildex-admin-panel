import { Button, Tag, type TableColumnsType } from "antd";
import type { TFunction } from "i18next";
import { formatDateTime } from "@/shared/lib/format";
import { InitialsAvatar } from "@/shared/ui";
import type { StaffMember } from "../model/types";

interface Options {
  t: TFunction;
  /** the signed-in account — marked "(siz)" */
  currentUserId: number | undefined;
  onUnblock: (member: StaffMember) => void;
}

/** Xodim · Login · Kirish darajasi · Holat · Oxirgi kirish · Yaratgan (the "⋯" column is added by the table). */
export const staffColumns = ({
  t,
  currentUserId,
  onUnblock,
}: Options): TableColumnsType<StaffMember> => [
  {
    key: "name",
    title: t("staff.columns.name"),
    render: (_, member) => (
      <div className="flex items-center gap-3">
        <InitialsAvatar name={member.fullName} />
        <div className="min-w-0">
          <div className="truncate font-bold">
            {member.fullName}
            {member.id === currentUserId && (
              <span className="ml-1.5 text-xs font-normal text-slate-400">({t("staff.you")})</span>
            )}
          </div>
          {member.position && <div className="text-xs text-slate-500">{member.position}</div>}
        </div>
      </div>
    ),
  },
  {
    key: "login",
    title: t("staff.columns.login"),
    width: 180,
    render: (_, member) => <code className="font-mono text-[13px]">{member.username}</code>,
  },
  {
    key: "access",
    title: t("staff.columns.access"),
    width: 150,
    render: (_, member) => (
      <Tag
        color={member.accessLevel === "super_admin" ? "blue" : "default"}
        variant="filled"
        className="m-0 font-semibold"
      >
        {t(`staff.access.${member.accessLevel}`)}
      </Tag>
    ),
  },
  {
    key: "status",
    title: t("staff.columns.status"),
    width: 330,
    render: (_, member) => {
      if (member.status === "active") {
        return (
          <Tag color="green" variant="filled" className="m-0 font-semibold">
            {t("staff.status.active")}
          </Tag>
        );
      }
      const byAttempts = member.blockReason === "failed_attempts";
      return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Tag color={byAttempts ? "gold" : "red"} variant="filled" className="m-0 font-semibold">
            {byAttempts
              ? t("staff.status.blockedAttempts", { count: member.failedLoginAttempts })
              : t("staff.status.blocked")}
          </Tag>
          {byAttempts && (
            <span onClick={(event) => event.stopPropagation()}>
              <Button type="link" size="small" className="p-0" onClick={() => onUnblock(member)}>
                {t("staff.unblock")}
              </Button>
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "lastLogin",
    title: t("staff.columns.lastLogin"),
    width: 170,
    render: (_, member) => (member.lastLogin ? formatDateTime(member.lastLogin) : "—"),
  },
  {
    key: "createdBy",
    title: t("staff.columns.createdBy"),
    width: 150,
    render: (_, member) => member.createdBy?.fullName || member.createdBy?.username || "—",
  },
];
