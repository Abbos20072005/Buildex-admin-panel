import { Drawer, Grid, Layout } from "antd";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth";
import { brand } from "@/theme";
import { Logo } from "@/shared/ui";
import { SidebarMenu } from "./SidebarMenu";

export const SIDEBAR_WIDTH = 240;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[60px] shrink-0 items-center px-5">
        <Logo />
      </div>
      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto pb-2">
        <SidebarMenu onNavigate={onNavigate} />
      </div>
      {user && (
        <div className="m-3 rounded-xl bg-navy-light px-3.5 py-3">
          <div className="truncate text-sm font-semibold text-white">{user.name}</div>
          <div className="text-xs text-slate-400">
            {user.isSuperuser ? t("common.superadmin") : t("common.admin")}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/** Fixed sider on desktop, a drawer on tablets/phones. */
export function Sidebar({ mobileOpen, onMobileClose }: Props) {
  const screens = Grid.useBreakpoint();
  const isDesktop = !!screens.lg;

  if (!isDesktop) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        placement="left"
        size={SIDEBAR_WIDTH}
        closable={false}
        styles={{ body: { padding: 0, background: brand.navy } }}
      >
        <SidebarContent onNavigate={onMobileClose} />
      </Drawer>
    );
  }

  return (
    <Layout.Sider width={SIDEBAR_WIDTH} className="fixed! inset-y-0 left-0 z-20 h-screen">
      <SidebarContent />
    </Layout.Sider>
  );
}
