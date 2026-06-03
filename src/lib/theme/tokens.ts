/**
 * Programmatic access to design tokens (mirrors CSS variables in globals.css).
 * Use for charts, Three.js, or runtime logic — prefer CSS vars in components.
 */
export const terminalTheme = {
  colors: {
    background: "#08090c",
    surface: "#14161b",
    surfaceElevated: "#1a1d24",
    surfaceInset: "#0e1014",
    border: "#2a3038",
    borderSubtle: "#1f242b",
    foreground: "#eceff4",
    muted: "#8b9aad",
    accent: "#3dd6f5",
    accentMuted: "#2a9fb8",
    accentViolet: "#8b7cf8",
    accentVioletMuted: "#6b5fd4",
    success: "#4ade80",
    warning: "#f5b942",
  },
  glow: {
    cyan: "rgba(61, 214, 245, 0.1)",
    violet: "rgba(139, 124, 248, 0.08)",
  },
  grid: {
    line: "rgba(42, 48, 56, 0.35)",
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
