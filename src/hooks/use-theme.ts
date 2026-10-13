"use client";

import { useCallback, useSyncExternalStore } from "react";
import { applyTheme, readTheme, subscribeTheme, type Theme } from "@/lib/theme/theme";

/** The active theme (from <html data-theme>), plus a toggle that persists it. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribeTheme, readTheme, () => "dark");
  const toggle = useCallback(() => applyTheme(readTheme() === "dark" ? "light" : "dark"), []);
  return { theme, toggle };
}
