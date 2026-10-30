import { Button, Checkbox, DatePicker, Input, InputNumber, Popover, Select, Tooltip } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "@/shared/icons";
import {
  CUSTOMER_STATES,
  DATE_FORMAT,
  stateOfFilters,
  withState,
  type CustomerState,
  type CustomerTab,
} from "../lib/filters";
import { useSavedViews, type SavedView } from "../hooks/useSavedViews";
import { CUSTOMER_API } from "../model/capabilities";
import {
  CUSTOMER_CHANNELS,
  CUSTOMER_ROLES,
  CUSTOMER_SEGMENTS,
  type CustomerChannel,
  type CustomerFilters,
  type CustomerRole,
  type CustomerSegment,
} from "../model/types";

interface Props {
  /** the filters in force; the panel edits a copy until "Qo'llash" */
  value: CustomerFilters;
  tab: CustomerTab;
  onApply: (filters: CustomerFilters) => void;
  onApplyView: (view: SavedView) => void;
  onReset: () => void;
}

const range = (from?: string, to?: string): [Dayjs | null, Dayjs | null] => [
  from ? dayjs(from) : null,
  to ? dayjs(to) : null,
];

/** A field of the panel: a label above the control; unfinished fields wait for the backend. */
function Field({
  label,
  upper,
  soon,
  children,
  className,
}: {
  label: string;
  upper?: boolean;
  soon?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <div
        className={`mb-1.5 text-xs font-semibold text-slate-600 ${upper ? "tracking-wide uppercase" : ""}`}
      >
        {label}
        {soon && (
          <span className="ml-1.5 font-normal tracking-normal text-slate-400 normal-case">
            · {t("customers.soon")}
          </span>
        )}
      </div>
      {soon ? (
        <Tooltip title={t("customers.soon")}>
          <div className="cursor-not-allowed opacity-60 [&>*]:pointer-events-none">{children}</div>
        </Tooltip>
      ) : (
        children
      )}
    </div>
  );
}

/** "min – max" number pair. */
function NumberRange({
  min,
  max,
  onChange,
  disabled,
}: {
  min?: number;
  max?: number;
  onChange: (min?: number, max?: number) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const props = {
    controls: false,
    min: 0,
    disabled,
    className: "w-full",
    formatter: (value: number | string | undefined) =>
      String(value ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, " "),
    parser: (value: string | undefined) => Number((value ?? "").replace(/\s/g, "")),
  };
  return (
    <div className="flex items-center gap-2">
      <InputNumber
        {...props}
        placeholder={t("customers.filters.min")}
        value={min}
        onChange={(next) => onChange(next ?? undefined, max)}
      />
      <span className="text-slate-400">–</span>
      <InputNumber
        {...props}
        placeholder={t("customers.filters.max")}
        value={max}
        onChange={(next) => onChange(min, next ?? undefined)}
      />
    </div>
  );
}

/** The advanced filters, the saved views and the "Qo'llash" button. */
export function CustomerFilterPanel({ value, tab, onApply, onApplyView, onReset }: Props) {
  const { t } = useTranslation();
  const saved = useSavedViews();
  const [draft, setDraft] = useState<CustomerFilters>(value);
  const [viewName, setViewName] = useState("");
  const [namePopover, setNamePopover] = useState(false);

  const patch = (next: Partial<CustomerFilters>) =>
    setDraft((current) => ({ ...current, ...next }));
  const dates = (from?: string, to?: string) => range(from, to);
  const stamp = (date: Dayjs | null) => date?.format(DATE_FORMAT);

  const saveView = () => {
    const name = viewName.trim();
    if (!name) return;
    saved.save(name, tab, draft);
    setViewName("");
    setNamePopover(false);
  };

  const viewLabel = (view: SavedView) =>
    view.builtIn ? t(`customers.views.${view.name}`) : view.name;

  return (
    <div className="border-t border-slate-100 px-4 pt-4 pb-4">
      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 xl:grid-cols-5">
        <Field label={t("customers.filters.segment")} soon={!CUSTOMER_API.segments}>
          <Select<CustomerSegment | "all">
            className="w-full"
            value={draft.segment ?? "all"}
            onChange={(next) => patch({ segment: next === "all" ? undefined : next })}
            options={[
              { value: "all", label: t("common.all") },
              ...CUSTOMER_SEGMENTS.map((key) => ({
                value: key,
                label: t(`customers.segments.${key}`),
              })),
            ]}
          />
        </Field>
        <Field label={t("customers.filters.state")}>
          <Select<CustomerState | "all">
            className="w-full"
            value={stateOfFilters(draft) ?? "all"}
            onChange={(next) => setDraft(withState(draft, next === "all" ? undefined : next))}
            options={[
              { value: "all", label: t("common.all") },
              ...CUSTOMER_STATES.map((key) => ({
                value: key,
                label: t(`customers.stateFilter.${key}`),
              })),
            ]}
          />
        </Field>
        <Field label={t("customers.filters.channel")} soon={!CUSTOMER_API.registrationChannel}>
          <Select<CustomerChannel | "all">
            className="w-full"
            value={draft.channel ?? "all"}
            onChange={(next) => patch({ channel: next === "all" ? undefined : next })}
            options={[
              { value: "all", label: t("common.all") },
              ...CUSTOMER_CHANNELS.map((key) => ({
                value: key,
                label: t(`customers.channel.${key}`),
              })),
            ]}
          />
        </Field>
        <Field label={t("customers.filters.registered")} className="xl:col-span-2">
          <DatePicker.RangePicker
            className="w-full"
            format="DD.MM.YY"
            allowClear
            value={dates(draft.from, draft.to)}
            onChange={(next) =>
              patch({ from: stamp(next?.[0] ?? null), to: stamp(next?.[1] ?? null) })
            }
          />
        </Field>
        <Field label={t("customers.filters.role")}>
          <Select<CustomerRole | "all">
            className="w-full"
            value={draft.role ?? "all"}
            onChange={(next) => patch({ role: next === "all" ? undefined : next })}
            options={[
              { value: "all", label: t("common.all") },
              ...CUSTOMER_ROLES.map((key) => ({ value: key, label: t(`role.${key}`) })),
            ]}
          />
        </Field>
        <Field label={t("customers.filters.orders")} upper soon={!CUSTOMER_API.rangeFilters}>
          <NumberRange
            min={draft.ordersMin}
            max={draft.ordersMax}
            onChange={(ordersMin, ordersMax) => patch({ ordersMin, ordersMax })}
          />
        </Field>
        <Field label={t("customers.filters.purchase")} upper soon={!CUSTOMER_API.rangeFilters}>
          <NumberRange
            min={draft.purchaseMin}
            max={draft.purchaseMax}
            onChange={(purchaseMin, purchaseMax) => patch({ purchaseMin, purchaseMax })}
          />
        </Field>
        <Field
          label={t("customers.filters.lastOrder")}
          upper
          soon={!CUSTOMER_API.rangeFilters}
          className="xl:col-span-2"
        >
          <DatePicker.RangePicker
            className="w-full"
            format="DD.MM.YY"
            allowClear
            value={dates(draft.lastOrderFrom, draft.lastOrderTo)}
            onChange={(next) =>
              patch({
                lastOrderFrom: stamp(next?.[0] ?? null),
                lastOrderTo: stamp(next?.[1] ?? null),
              })
            }
          />
        </Field>
      </div>

      <div className="mt-4">
        <Tooltip title={CUSTOMER_API.returns ? undefined : t("customers.soon")}>
          <Checkbox
            disabled={!CUSTOMER_API.returns}
            checked={draft.hasReturns === true}
            onChange={(event) => patch({ hasReturns: event.target.checked || undefined })}
          >
            {t("customers.filters.hasReturns")}
          </Checkbox>
        </Tooltip>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-slate-200 pt-4">
        <span className="text-xs text-slate-500">{t("customers.filters.saved")}</span>
        {saved.views.map((view) => (
          <span
            key={view.id}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white text-sm font-medium"
          >
            <Tooltip title={view.waitsForBackend ? t("customers.soon") : undefined}>
              <button
                type="button"
                disabled={view.waitsForBackend}
                onClick={() => onApplyView(view)}
                className="cursor-pointer rounded-full border-0 bg-transparent px-3 py-1 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {viewLabel(view)}
              </button>
            </Tooltip>
            {!view.builtIn && (
              <button
                type="button"
                aria-label={t("common.delete")}
                onClick={() => saved.remove(view.id)}
                className="mr-1.5 grid size-5 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-slate-400 hover:text-slate-700"
              >
                <CloseIcon className="size-3" />
              </button>
            )}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Button type="text" onClick={onReset}>
            {t("customers.filters.clear")}
          </Button>
          <Popover
            trigger="click"
            open={namePopover}
            onOpenChange={setNamePopover}
            content={
              <div className="flex w-64 gap-2">
                <Input
                  autoFocus
                  placeholder={t("customers.filters.viewName")}
                  value={viewName}
                  onChange={(event) => setViewName(event.target.value)}
                  onPressEnter={saveView}
                />
                <Button type="primary" disabled={!viewName.trim()} onClick={saveView}>
                  {t("customers.save")}
                </Button>
              </div>
            }
          >
            <Button>{t("customers.filters.saveView")}</Button>
          </Popover>
          <Button
            className="border-0 bg-slate-900 text-white dark:text-slate-50 hover:bg-slate-700!"
            onClick={() => onApply(draft)}
          >
            {t("customers.filters.apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}
