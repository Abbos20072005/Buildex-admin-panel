import { Select, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { CUSTOMER_API } from "../../model/capabilities";
import { CUSTOMER_SEGMENTS, type Customer, type CustomerSegment } from "../../model/types";
import { usePatchCustomerProfile } from "../../hooks/queries";
import { InfoRow, SectionCard } from "./SectionCard";

/** The segment (a tier set by hand) and the tags. Until the backend has them, the role is shown. */
export function SegmentCard({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const patch = usePatchCustomerProfile();

  if (!CUSTOMER_API.segments) {
    return (
      <SectionCard title={t("customers.segment.title")} flush>
        <div className="px-5">
          <InfoRow label={t("customers.segment.title")}>
            <span className="font-semibold">{t(`role.${customer.role}`)}</span>{" "}
            <span className="text-xs text-slate-500">{t("customers.segment.readOnly")}</span>
          </InfoRow>
          <InfoRow label={t("customers.segment.tags")} last>
            <Tooltip title={t("customers.soon")}>
              <span className="inline-block cursor-not-allowed rounded-md border border-dashed border-slate-300 px-2.5 py-0.5 text-sm text-slate-400">
                + {t("customers.segment.tag")}
              </span>
            </Tooltip>
          </InfoRow>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={t("customers.segment.title")} flush>
      <div className="px-5">
        <InfoRow label={t("customers.segment.title")}>
          <Select<CustomerSegment>
            className="w-48"
            value={customer.segment ?? undefined}
            placeholder="—"
            loading={patch.isPending}
            onChange={(segment) => patch.mutate({ id: customer.id, patch: { segment } })}
            options={CUSTOMER_SEGMENTS.map((key) => ({
              value: key,
              label: t(`customers.segments.${key}`),
            }))}
          />
        </InfoRow>
        <InfoRow label={t("customers.segment.tags")} last>
          <Select
            mode="tags"
            className="w-full"
            value={customer.tags}
            tokenSeparators={[","]}
            onChange={(tags: string[]) => patch.mutate({ id: customer.id, patch: { tags } })}
          />
        </InfoRow>
      </div>
    </SectionCard>
  );
}
