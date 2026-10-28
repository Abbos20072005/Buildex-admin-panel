import { CheckCircleIcon, CloseCircleIcon } from "@/shared/icons";
import { Alert, Button, Drawer, Segmented, Skeleton } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatDateTime } from "@/shared/lib/format";
import { useModerationDetailQuery } from "../hooks/queries";
import { READINESS_KEYS, type ModerationDetail } from "../model/types";
import { ProductPreview, type PreviewLang, type PreviewSurface } from "./ProductPreview";
import { getErrorMessage } from "@/shared/api";

interface Props {
  id: number;
  onClose: () => void;
  onApprove: (item: ModerationDetail) => void;
  onReject: (item: ModerationDetail) => void;
  busy: boolean;
}

function Checklist({ item }: { item: ModerationDetail }) {
  const { t } = useTranslation();
  // the checklist from the API; without it, derive the same rows from `missing`
  const checks =
    item.checks.length > 0
      ? item.checks
      : READINESS_KEYS.map((key) => ({ key, done: !item.readiness.missing.includes(key) }));

  return (
    <ul className="m-0 list-none divide-y divide-slate-100 p-0">
      {checks.map((check) => (
        <li key={check.key} className="py-2">
          <div className="flex items-center gap-2 text-sm">
            {check.done ? (
              <CheckCircleIcon className="text-green-600" />
            ) : (
              <CloseCircleIcon className="text-red-600" />
            )}
            <span className={check.done ? "text-slate-700" : "font-semibold text-red-600"}>
              {t(`moderation.checks.${check.key}`)}
            </span>
            {!check.done && (
              <Link to={`/products/${item.product.id}`} className="ml-auto text-xs font-semibold">
                {t("moderation.fill")}
              </Link>
            )}
          </div>
          {!check.done &&
            check.key === "required_attributes" &&
            item.missingAttributes.length > 0 && (
              <div className="mt-1 pl-6 text-xs text-slate-500">
                {item.missingAttributes.map((attribute) => attribute.name).join(", ")}
              </div>
            )}
        </li>
      ))}
    </ul>
  );
}

/** Review of one product: how it will look, what is missing, approve / reject. */
export function ModerationDrawer({ id, onClose, onApprove, onReject, busy }: Props) {
  const { t } = useTranslation();
  const [surface, setSurface] = useState<PreviewSurface>("site");
  const [lang, setLang] = useState<PreviewLang>("uz");
  const query = useModerationDetailQuery(id);
  const item = query.data;
  const missing = item ? item.readiness.total - item.readiness.done : 0;

  return (
    <Drawer
      open
      size={520}
      rootClassName="[&_.ant-drawer-content-wrapper]:max-w-screen"
      onClose={onClose}
      destroyOnHidden
      title={
        item ? (
          <div className="min-w-0">
            <div className="truncate text-base font-bold">{item.product.name}</div>
            <div className="font-mono text-xs font-normal text-slate-500">
              {item.product.articulCode ?? item.product.productCode}
            </div>
          </div>
        ) : (
          t("moderation.title")
        )
      }
      footer={
        item?.status === "pending" ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-red-600">
              {missing > 0 ? t("moderation.missingFooter", { count: missing }) : ""}
            </span>
            <div className="flex gap-2">
              <Button danger disabled={busy} onClick={() => onReject(item)}>
                {t("moderation.reject")}
              </Button>
              <Button
                type="primary"
                className="btn-success"
                loading={busy}
                disabled={!item.readiness.ready}
                onClick={() => onApprove(item)}
              >
                {t("moderation.approve")}
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {query.error && !item ? (
        <Alert type="error" showIcon title={getErrorMessage(query.error)} />
      ) : !item ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <div className="space-y-5">
          {item.status !== "pending" && (
            <Alert
              type={item.status === "approved" ? "success" : "error"}
              showIcon
              title={t(`moderation.reviewed.${item.status}`, {
                name: item.reviewedBy?.name || "—",
                date: formatDateTime(item.reviewedAt),
              })}
              description={item.reason || undefined}
            />
          )}

          <div className="flex items-center justify-between gap-3">
            <Segmented<PreviewSurface>
              value={surface}
              onChange={setSurface}
              options={[
                { value: "site", label: t("moderation.preview.site") },
                { value: "app", label: t("moderation.preview.app") },
              ]}
            />
            <Segmented<PreviewLang>
              value={lang}
              onChange={setLang}
              options={[
                { value: "uz", label: "UZ" },
                { value: "ru", label: "RU" },
              ]}
            />
          </div>

          <ProductPreview product={item.product} surface={surface} lang={lang} />

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-bold">{t("moderation.readiness")}</span>
              <span
                className={
                  item.readiness.ready
                    ? "rounded-md bg-green-50 px-2 text-xs leading-5 font-bold text-green-700"
                    : "rounded-md bg-amber-50 px-2 text-xs leading-5 font-bold text-amber-700"
                }
              >
                {item.readiness.done} / {item.readiness.total}
              </span>
            </div>
            <Checklist item={item} />
          </div>
        </div>
      )}
    </Drawer>
  );
}
