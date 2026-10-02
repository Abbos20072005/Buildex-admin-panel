import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import type { AttributeValueType } from "../model/types";

/** "Son" / "Ro'yxat" / "Matn" / "Ha / yo'q" chip */
export function ValueTypeTag({ type }: { type: AttributeValueType }) {
  const { t } = useTranslation();
  return (
    <Tag variant="filled" className="m-0 font-semibold">
      {t(`attributes.types.${type}`)}
    </Tag>
  );
}
