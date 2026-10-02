import { CheckCircleOutlined, SaveOutlined, SendOutlined, UndoOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslation } from "react-i18next";
import type { ProductDetail, PublishStatus } from "../../model/types";
import { PublishStatusTag } from "../ProductBits";

interface Props {
  product: ProductDetail;
  dirty: boolean;
  saving: boolean;
  onSave: (publishStatus?: PublishStatus) => void;
  onReset: () => void;
}

export function ProductPageHeader({ product, dirty, saving, onSave, onReset }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="m-0 text-xl leading-tight font-bold tracking-tight">{product.name}</h1>
          <PublishStatusTag status={product.publishStatus} />
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 font-mono text-xs font-normal text-slate-500">
          <span>ID {product.id}</span>
          {product.code && <span>1C: {product.code}</span>}
          {product.barcode && <span>{product.barcode}</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button icon={<UndoOutlined />} disabled={!dirty || saving} onClick={onReset}>
          {t("products.modal.reset")}
        </Button>
        <Button
          icon={<SaveOutlined />}
          type={dirty ? "primary" : "default"}
          ghost={dirty}
          disabled={!dirty}
          loading={saving}
          onClick={() => onSave()}
        >
          {t("products.modal.save")}
        </Button>
        {product.publishStatus === "draft" && (
          <Button
            type="primary"
            icon={<SendOutlined />}
            disabled={saving}
            onClick={() => onSave("review")}
          >
            {t("products.modal.sendToReview")}
          </Button>
        )}
        {product.publishStatus === "review" && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={saving}
            onClick={() => onSave("published")}
          >
            {t("products.modal.publishNow")}
          </Button>
        )}
      </div>
    </div>
  );
}
