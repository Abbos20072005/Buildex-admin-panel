import { Spin } from "antd";
import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CHANGE_PASSWORD_PATH, RequireAuth } from "@/features/auth";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { NAV_LEAVES } from "@/layouts/admin/navigation";

// pages are code-split: each one is downloaded only when it is opened
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const OrdersPage = lazy(() =>
  import("@/pages/OrdersPage").then((m) => ({ default: m.OrdersPage })),
);
const ProductsPage = lazy(() =>
  import("@/pages/ProductsPage").then((m) => ({ default: m.ProductsPage })),
);
const AttributesPage = lazy(() =>
  import("@/pages/AttributesPage").then((m) => ({ default: m.AttributesPage })),
);
const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const BannersPage = lazy(() =>
  import("@/pages/BannersPage").then((m) => ({ default: m.BannersPage })),
);
const BannerPage = lazy(() =>
  import("@/pages/BannerPage").then((m) => ({ default: m.BannerPage })),
);
const PartnerBrandsPage = lazy(() =>
  import("@/pages/PartnerBrandsPage").then((m) => ({ default: m.PartnerBrandsPage })),
);
const TodayPage = lazy(() => import("@/pages/TodayPage").then((m) => ({ default: m.TodayPage })));
const ModelsPage = lazy(() =>
  import("@/pages/ModelsPage").then((m) => ({ default: m.ModelsPage })),
);
const TagsPage = lazy(() => import("@/pages/TagsPage").then((m) => ({ default: m.TagsPage })));
const BrandsPage = lazy(() =>
  import("@/pages/BrandsPage").then((m) => ({ default: m.BrandsPage })),
);
const CategoriesPage = lazy(() =>
  import("@/pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage })),
);
const ProductPage = lazy(() =>
  import("@/pages/ProductPage").then((m) => ({ default: m.ProductPage })),
);
const PublicationsPage = lazy(() =>
  import("@/pages/PublicationsPage").then((m) => ({ default: m.PublicationsPage })),
);
const AdBlocksPage = lazy(() =>
  import("@/pages/AdBlocksPage").then((m) => ({ default: m.AdBlocksPage })),
);
const PushPage = lazy(() => import("@/pages/PushPage").then((m) => ({ default: m.PushPage })));
const PushEditPage = lazy(() =>
  import("@/pages/PushEditPage").then((m) => ({ default: m.PushEditPage })),
);
const CustomersPage = lazy(() =>
  import("@/pages/CustomersPage").then((m) => ({ default: m.CustomersPage })),
);
const ManagersPage = lazy(() =>
  import("@/pages/ManagersPage").then((m) => ({ default: m.ManagersPage })),
);
const StaffPage = lazy(() => import("@/pages/StaffPage").then((m) => ({ default: m.StaffPage })));
const ChangePasswordPage = lazy(() =>
  import("@/pages/ChangePasswordPage").then((m) => ({ default: m.ChangePasswordPage })),
);
const ComingSoonPage = lazy(() =>
  import("@/pages/ComingSoonPage").then((m) => ({ default: m.ComingSoonPage })),
);

/** Routes that already have a real page; every other sidebar item shows "coming soon". */
const PAGES: Record<string, ReactNode> = {
  "/dashboard": <DashboardPage />,
  "/content/banners": <BannersPage />,
  "/content/news": <PublicationsPage />,
  "/content/ad-blocks": <AdBlocksPage />,
  "/content/push": <PushPage />,
  "/today": <TodayPage />,
  "/orders": <OrdersPage />,
  "/customers": <CustomersPage />,
  "/managers": <ManagersPage />,
  "/settings/staff": <StaffPage />,
  "/products": <ProductsPage />,
  "/attributes/categories": <CategoriesPage />,
  "/attributes/brands": <BrandsPage />,
  "/attributes/tags": <TagsPage />,
  "/attributes/models": <ModelsPage />,
  "/attributes/partner-brands": <PartnerBrandsPage />,
  "/attributes/characteristics": <AttributesPage />,
};

function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Spin size="large" />
    </div>
  );
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path={CHANGE_PASSWORD_PATH}
          element={
            <RequireAuth>
              <ChangePasswordPage />
            </RequireAuth>
          }
        />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/orders" replace />} />
          {NAV_LEAVES.map((leaf) => (
            <Route
              key={leaf.path}
              path={leaf.path}
              element={PAGES[leaf.path] ?? <ComingSoonPage titleKey={leaf.label} />}
            />
          ))}
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/content/push/new" element={<PushEditPage />} />
          <Route path="/content/push/:id" element={<PushEditPage />} />
          <Route path="/content/banners/new" element={<BannerPage />} />
          <Route path="/content/banners/:id" element={<BannerPage />} />
          <Route path="*" element={<Navigate to="/orders" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
