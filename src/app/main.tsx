import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/shared/i18n";
import "../index.css";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";

// After a new deploy the page that is already open still points at the old hashed chunks
// ("Failed to fetch dynamically imported module"): load the new build once. The flag stops a loop
// when the chunk is really missing.
window.addEventListener("vite:preloadError", (event) => {
  try {
    if (sessionStorage.getItem("chunk-reload")) return;
    sessionStorage.setItem("chunk-reload", "1");
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});
// the guard is lifted after a while, so a later deploy can reload again
setTimeout(() => {
  try {
    sessionStorage.removeItem("chunk-reload");
  } catch {
    // storage is blocked: nothing to lift
  }
}, 30_000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
