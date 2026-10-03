import { Alert, Skeleton } from "antd";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";
import { BANNERS_PATH, BannerForm, useBannerQuery } from "@/features/banners";
import { getErrorMessage } from "@/shared/api";

/** /content/banners/new — a new banner; /content/banners/:id — an existing one. */
export function BannerPage() {
  const { t } = useTranslation();
  const raw = useParams().id;
  const id = raw === undefined ? null : Number(raw);
  const invalid = id !== null && (!Number.isInteger(id) || id <= 0);

  const banner = useBannerQuery(invalid ? null : id);

  if (invalid) return <Navigate to={BANNERS_PATH} replace />;
  if (id === null) return <BannerForm banner={null} />;
  if (banner.error) {
    return (
      <Alert
        type="error"
        showIcon
        title={t("banners.loadError")}
        description={getErrorMessage(banner.error)}
      />
    );
  }
  if (!banner.data) return <Skeleton active paragraph={{ rows: 10 }} />;
  // key: the form restarts from the saved values after a save
  return <BannerForm key={`${banner.data.id}-${banner.data.status}`} banner={banner.data} />;
}
