import { StyleProvider } from "@ant-design/cssinjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntApp, ConfigProvider } from "antd";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/features/auth";
import { ApiError } from "@/shared/api";
import { getLanguage } from "@/shared/i18n";
import { theme } from "@/theme";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // don't hammer the API on auth / validation errors
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
          failureCount < 2,
      },
    },
  });
}

/** antd follows the active i18next language (pagination, date picker texts…) */
function LocalizedConfigProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  return (
    <ConfigProvider theme={theme} locale={getLanguage(i18n.language).antd}>
      {children}
    </ConfigProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  // a data router (not <BrowserRouter>) so forms can block navigation with unsaved edits;
  // the real routes stay in <AppRouter>
  const [router] = useState(() =>
    createBrowserRouter([{ path: "*", element: <AuthProvider>{children}</AuthProvider> }]),
  );

  return (
    // antd styles go into @layer antd (see index.css) so Tailwind utilities can override them
    <StyleProvider layer>
      <LocalizedConfigProvider>
        <AntApp>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </AntApp>
      </LocalizedConfigProvider>
    </StyleProvider>
  );
}
