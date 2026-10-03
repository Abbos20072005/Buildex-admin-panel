import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "@/shared/lib/clsx";
import { WidgetCard } from "@/shared/ui";

type Mode = "desktop" | "mobile";

/** How the banner looks: a wide strip on the site, a square card in the phone app. */
export function BannerPreview({
  desktopSrc,
  mobileSrc,
}: {
  desktopSrc: string | null;
  mobileSrc: string | null;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("desktop");
  // without a square picture the app falls back to the wide one
  const phoneSrc = mobileSrc ?? desktopSrc;

  return (
    <WidgetCard
      title={t("banners.preview.title")}
      extra={
        <Segmented<Mode>
          size="small"
          value={mode}
          onChange={setMode}
          options={[
            { value: "desktop", label: t("banners.preview.desktop") },
            { value: "mobile", label: t("banners.preview.mobile") },
          ]}
        />
      }
    >
      {mode === "desktop" ? (
        <div className="aspect-[16/5] overflow-hidden rounded-lg bg-slate-100">
          {desktopSrc ? (
            <img src={desktopSrc} alt="" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-xs text-slate-400">
              {t("banners.preview.empty")}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto w-56 rounded-[28px] border-[6px] border-slate-900 bg-white p-3">
          <div className="mb-2 text-xs font-bold">Buildex Go</div>
          <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
            {phoneSrc ? (
              <img src={phoneSrc} alt="" className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-xs text-slate-400">
                {t("banners.preview.empty")}
              </div>
            )}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

export interface ReadinessItem {
  key: string;
  done: boolean;
}

/** What is still missing before the banner can be saved. */
export function BannerReadiness({ items }: { items: ReadinessItem[] }) {
  const { t } = useTranslation();
  return (
    <WidgetCard title={t("banners.readiness.title")}>
      <ul className="m-0 list-none p-0">
        {items.map((item) => (
          <li
            key={item.key}
            className={clsx(
              "flex items-center gap-2.5 border-b border-slate-100 py-2.5 text-sm last:border-b-0",
              item.done ? "text-slate-700" : "font-semibold text-red-600",
            )}
          >
            {item.done ? (
              <CheckCircleOutlined className="text-green-600" />
            ) : (
              <CloseCircleOutlined />
            )}
            {t(`banners.readiness.${item.key}`)}
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
