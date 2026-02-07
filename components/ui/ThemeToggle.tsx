"use client";

import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{
        padding: "0.5rem 0.75rem",
        borderRadius: "6px",
        border: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        color: "var(--text)",
        cursor: "pointer",
        fontSize: "0.875rem",
      }}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
