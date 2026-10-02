import { StarFilled } from "@ant-design/icons";
import { Card } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ProductDetail } from "../../model/types";

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

/** Calculated by the site — read only. */
export function ProductRatingCard({ product }: { product: ProductDetail }) {
  const { t } = useTranslation();

  return (
    <Card title={t("products.modal.rating")}>
      <div className="grid grid-cols-3 gap-3">
        <Stat
          label={t("products.modal.ratingValue")}
          value={
            product.rating ? (
              <span className="inline-flex items-center gap-1">
                <StarFilled className="text-brand-yellow" />
                {product.rating.toFixed(1)}
              </span>
            ) : (
              "—"
            )
          }
        />
        <Stat label={t("products.modal.comments")} value={product.commentsCount} />
        <Stat label={t("products.modal.questions")} value={product.questionsCount} />
      </div>
    </Card>
  );
}
