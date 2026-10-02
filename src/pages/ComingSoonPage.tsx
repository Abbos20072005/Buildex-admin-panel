import { RocketOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function ComingSoonPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">{t(titleKey)}</h1>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white">
        <Result
          icon={<RocketOutlined className="text-brand" />}
          title={t("common.soon")}
          subTitle={t("common.soonText")}
          extra={
            <Button type="primary" onClick={() => navigate("/orders")}>
              {t("common.backToOrders")}
            </Button>
          }
        />
      </div>
    </>
  );
}
