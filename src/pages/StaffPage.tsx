import { LockIcon, PlusIcon, SearchIcon } from "@/shared/icons";
import { App, Button, Input, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth";
import {
  staffColumns,
  StaffEditor,
  useBlockStaff,
  useResetStaffPassword,
  useStaffQuery,
  type AccessLevel,
  type StaffMember,
  type StaffStatus,
} from "@/features/staff";
import { getErrorMessage } from "@/shared/api";
import { useConfirmIfDirty } from "@/shared/form";
import { formatNumber } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { RecordsTable, type RowMenuItem } from "@/shared/ui";

/** Sozlamalar → Xodimlar: accounts that sign in to the admin panel (Super admin only). */
export function StaffPage() {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [access, setAccess] = useState<AccessLevel | "all">("all");
  const [status, setStatus] = useState<StaffStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  /** "new" — the create form is open; a member — that one is open */
  const [selected, setSelected] = useState<StaffMember | "new" | null>(null);
  const confirmIfDirty = useConfirmIfDirty();

  const list = useStaffQuery({
    filters: {
      search: useDebouncedValue(search, 300),
      accessLevel: access === "all" ? undefined : access,
      status: status === "all" ? undefined : status,
    },
    page,
    pageSize,
  });
  const reset = useResetStaffPassword();
  const block = useBlockStaff();

  const confirmBlock = (member: StaffMember, blocking: boolean) =>
    modal.confirm({
      title: t(blocking ? "staff.blockConfirm" : "staff.unblockConfirm"),
      content: blocking ? t("staff.blockHint", { name: member.fullName }) : member.fullName,
      okText: t(blocking ? "staff.block" : "staff.unblock"),
      okButtonProps: { danger: blocking },
      cancelText: t("common.cancel"),
      onOk: () =>
        block.mutateAsync({ id: member.id, block: blocking }).then(
          () => message.success(t(blocking ? "staff.blocked" : "staff.unblocked")),
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  const confirmReset = (member: StaffMember) =>
    modal.confirm({
      title: t("staff.resetConfirm"),
      content: t("staff.resetHint", { name: member.fullName }),
      okText: t("staff.reset"),
      cancelText: t("common.cancel"),
      onOk: () =>
        reset.mutateAsync(member.id).then(
          (result) => {
            // the password is shown here once and can't be read again
            modal.success({
              title: t("staff.newPasswordTitle"),
              icon: <LockIcon className="text-brand" />,
              content: (
                <div className="space-y-3">
                  <p className="m-0 text-sm text-slate-600">
                    {t("staff.newPasswordHint", { name: member.fullName })}
                  </p>
                  <Input
                    readOnly
                    value={result.password}
                    className="font-mono"
                    onFocus={(event) => event.target.select()}
                    suffix={
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          void navigator.clipboard
                            .writeText(result.password)
                            .then(() => message.success(t("staff.copied")))
                        }
                      >
                        {t("staff.copy")}
                      </Button>
                    }
                  />
                </div>
              ),
              okText: t("common.close"),
            });
          },
          (error: unknown) => message.error(getErrorMessage(error)),
        ),
    });

  const rowMenu = (member: StaffMember): RowMenuItem[] => [
    { key: "open", label: t("staff.openCard") },
    { key: "reset", label: t("staff.resetPassword") },
    member.status === "blocked"
      ? { key: "unblock", label: t("staff.unblock"), separated: true }
      : {
          key: "block",
          label: t("staff.block"),
          danger: true,
          separated: true,
          // blocking yourself is refused by the API
          disabled: member.id === user?.id,
        },
  ];

  const onMenuAction = (key: string, member: StaffMember) => {
    if (key === "open") confirmIfDirty(() => setSelected(member));
    else if (key === "reset") confirmReset(member);
    else confirmBlock(member, key === "block");
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">{t("nav.systemSettings")}</div>
          <h1 className="m-0 text-2xl font-bold tracking-tight">
            {t("nav.staff")}{" "}
            {list.data && (
              <span className="font-medium text-slate-400">{formatNumber(list.data.total)}</span>
            )}
          </h1>
        </div>
        <Button
          type="primary"
          icon={<PlusIcon />}
          onClick={() => confirmIfDirty(() => setSelected("new"))}
        >
          {t("staff.add")}
        </Button>
      </div>

      <RecordsTable<StaffMember>
        toolbar={
          <>
            <Input
              allowClear
              className="w-72"
              prefix={<SearchIcon className="text-slate-400" />}
              placeholder={t("staff.search")}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Select<AccessLevel | "all">
              className="w-56"
              value={access}
              onChange={(value) => {
                setAccess(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: t("staff.filterAccess", { value: t("common.all") }) },
                {
                  value: "staff",
                  label: t("staff.filterAccess", { value: t("staff.access.staff") }),
                },
                {
                  value: "super_admin",
                  label: t("staff.filterAccess", { value: t("staff.access.super_admin") }),
                },
              ]}
            />
            <Select<StaffStatus | "all">
              className="w-48"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: t("staff.filterStatus", { value: t("common.all") }) },
                {
                  value: "active",
                  label: t("staff.filterStatus", { value: t("staff.status.active") }),
                },
                {
                  value: "blocked",
                  label: t("staff.filterStatus", { value: t("staff.status.blocked") }),
                },
              ]}
            />
          </>
        }
        totalLabel={(shown, total) => `${shown} / ${total} ${t("staff.unit")}`}
        columns={staffColumns({
          t,
          currentUserId: user?.id,
          onUnblock: (member) => confirmBlock(member, false),
        })}
        items={list.data?.items ?? []}
        total={list.data?.total ?? 0}
        loading={list.isFetching}
        page={page}
        pageSize={pageSize}
        onPageChange={(nextPage, nextSize) => {
          setPage(nextSize !== pageSize ? 1 : nextPage);
          setPageSize(nextSize);
        }}
        onOpen={(member) => confirmIfDirty(() => setSelected(member))}
        rowMenu={rowMenu}
        onMenuAction={onMenuAction}
      />
      {list.error && (
        <p className="mt-3 text-sm text-red-600">
          {t("staff.loadError")}: {getErrorMessage(list.error)}
        </p>
      )}

      {selected !== null && (
        <StaffEditor
          key={selected === "new" ? "new" : selected.id}
          item={selected === "new" ? null : selected}
          isSelf={selected !== "new" && selected.id === user?.id}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
