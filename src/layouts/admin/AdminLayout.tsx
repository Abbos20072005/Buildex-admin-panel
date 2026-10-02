import { Layout } from "antd";
import { useState, type CSSProperties } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";

export function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Layout className="min-h-screen" style={{ "--sider": `${SIDEBAR_WIDTH}px` } as CSSProperties}>
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <Layout className="lg:ms-(--sider)">
        <AppHeader onMenuClick={() => setMobileNavOpen(true)} />
        <Layout.Content className="p-3 sm:p-5">
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
