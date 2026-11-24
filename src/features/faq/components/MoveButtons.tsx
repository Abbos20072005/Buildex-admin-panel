import { ArrowDownIcon, ArrowUpIcon } from "@/shared/icons";
import { Button } from "antd";
import { useTranslation } from "react-i18next";

interface Props {
  index: number;
  count: number;
  disabled: boolean;
  onMove: (step: -1 | 1) => void;
}

/** "Up" / "down" arrows of a row: the order of the list is the order on the site. */
export function MoveButtons({ index, count, disabled, onMove }: Props) {
  const { t } = useTranslation();

  return (
    // the arrows must not open the record
    <span className="flex gap-1" onClick={(event) => event.stopPropagation()}>
      <Button
        size="small"
        type="text"
        icon={<ArrowUpIcon />}
        aria-label={t("faq.moveUp")}
        disabled={disabled || index === 0}
        onClick={() => onMove(-1)}
      />
      <Button
        size="small"
        type="text"
        icon={<ArrowDownIcon />}
        aria-label={t("faq.moveDown")}
        disabled={disabled || index === count - 1}
        onClick={() => onMove(1)}
      />
    </span>
  );
}
