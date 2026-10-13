/**
 * Programmatic access to design tokens (mirrors CSS variables in globals.css).
 * Prefer CSS vars/Tailwind classes in components; use this only where a raw
 * value is unavoidable (e.g. a canvas/SVG attribute that can't take a class).
 */
export const terminalTheme = {
  colors: {
    background: "#0a0a0a",
    surface: "#1a1a1a",
    surfaceElevated: "#212121",
    surfaceInset: "#0f0f0f",
    border: "#383838",
    borderSubtle: "#262626",
    foreground: "#f5f5f5",
    muted: "#8f8f8f",
  },
  grid: {
    line: "rgba(255, 255, 255, 0.05)",
    size: 24,
  },
  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
  },
  font: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
} as const;

export type TerminalTheme = typeof terminalTheme;

/** Raw canvas colors per theme (mirrors the light block in globals.css). */
export const canvasColors = {
  dark: {
    background: terminalTheme.colors.background,
    surfaceInset: terminalTheme.colors.surfaceInset,
    muted: terminalTheme.colors.muted,
    /** Graph nodes at rest */
    node: "#f5f5f5",
  },
  light: {
    background: "#f7f7f7",
    surfaceInset: "#f2f2f2",
    muted: "#7a7a7a",
    node: "#b4b4b4",
  },
} as const;
