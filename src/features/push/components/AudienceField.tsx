import { Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { formatNumber } from "@/shared/lib/format";
import { useAudienceQuery } from "../hooks/queries";
import { SEGMENTS } from "../model/constants";
import type { PushPlatform, PushSegment } from "../model/types";

interface Props {
  value?: PushSegment;
  onChange?: (value: PushSegment) => void;
  /** the devices counted under a segment follow the chosen platform */
  platform: PushPlatform;
  disabled?: boolean;
}

/** The audiences as cards: "PRO mijozlar · 3 940" and "1 497 qurilma" under it. */
export function AudienceField({ value, onChange, platform, disabled }: Props) {
  const { t } = useTranslation();
  const audience = useAudienceQuery();

  if (audience.isPending) return <Skeleton active paragraph={{ rows: 3 }} />;

  const devicesOf = (segment: PushSegment) => {
    const row = audience.data?.find((item) => item.segment === segment);
    if (!row) return null;
    const devices =
      platform === "ios"
        ? row.devicesIos
        : platform === "android"
          ? row.devicesAndroid
          : row.devices;
    return { customers: row.customers, devices };
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {SEGMENTS.map((segment) => {
        const counts = devicesOf(segment);
        const selected = value === segment;
        return (
          <button
            key={segment}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(segment)}
            className={clsx(
              "cursor-pointer rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
              selected
                ? "border-brand bg-brand-soft"
                : "border-slate-200 bg-white hover:border-slate-300",
            )}
          >
            <span className="flex items-center justify-between gap-2 text-sm font-semibold">
              <span>{t(`push.segments.${segment}`)}</span>
              {counts && <span className="tabular-nums">{formatNumber(counts.customers)}</span>}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {t(`push.segmentHints.${segment}`)}
            </span>
            {counts && (
              <span className="mt-1 block text-xs font-medium text-slate-600">
                {t("push.devices", { count: counts.devices })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
