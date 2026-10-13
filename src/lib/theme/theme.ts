export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "portfolio-theme";

/**
 * Runs inline in <head> before first paint so the page never flashes the
 * wrong theme: a saved choice wins, otherwise the OS preference. Kept as a
 * string because it must execute before React (and before any bundle) loads.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}var r=document.documentElement;r.dataset.theme=t;r.classList.toggle("dark",t==="dark")}catch(e){}})()`;

export function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode / blocked storage: the choice just won't persist.
  }
}

/** Fires `cb` whenever <html data-theme> changes, from any source. */
export function subscribeTheme(cb: () => void): () => void {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
