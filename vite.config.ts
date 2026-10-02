import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import { themeTokens } from "./vite/theme-tokens.ts";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_URL || "https://api.buildex.uz";

  return {
    plugins: [themeTokens(), react(), tailwindcss()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    build: {
      // antd is one ~400 kB (gzip) vendor chunk, cached separately from the app code
      chunkSizeWarningLimit: 1500,
      rolldownOptions: {
        output: {
          // long-lived vendor chunks: app updates don't invalidate the cached UI kit
          codeSplitting: {
            groups: [
              {
                name: "antd",
                test: /node_modules[\\/](antd|@ant-design|@rc-component|rc-[^\\/]+)[\\/]/,
              },
              {
                name: "react",
                test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              },
              { name: "vendor", test: /node_modules[\\/]/ },
            ],
          },
        },
      },
    },
    server: {
      // In dev the app calls /api/... on its own origin and Vite forwards it — no CORS issues locally.
      proxy: { "/api": { target, changeOrigin: true, secure: true } },
    },
  };
});
