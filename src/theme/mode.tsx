import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ThemeName } from "./antd";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "theme-mode";
const DARK_QUERY = "(prefers-color-scheme: dark)";

interface ThemeModeValue {
  mode: ThemeMode;
  /** what is actually shown (the "system" mode resolved) */
  resolved: ThemeName;
  setMode: (mode: ThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeValue | null>(null);

function readMode(): ThemeMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    // storage is blocked: follow the system
  }
  return "system";
}

const systemTheme = (): ThemeName => (window.matchMedia(DARK_QUERY).matches ? "dark" : "light");

/** Keeps the choice (light / dark / system), and puts the result on <html data-theme>. */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readMode);
  const [system, setSystem] = useState<ThemeName>(systemTheme);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onChange = () => setSystem(query.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolved = mode === "system" ? system : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }, [resolved]);

  const value = useMemo<ThemeModeValue>(
    () => ({
      mode,
      resolved,
      setMode: (next) => {
        setModeState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // storage is blocked: the choice lasts until the page is closed
        }
      },
    }),
    [mode, resolved],
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode(): ThemeModeValue {
  const value = useContext(ThemeModeContext);
  if (!value) throw new Error("useThemeMode must be used inside <ThemeModeProvider>");
  return value;
}
