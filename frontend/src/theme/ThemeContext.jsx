import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Switches the brand palette between "light" (brown/cream, the current
 * default) and "dark" (near-black brown + gold, matching the reference
 * mockup the shop owner sent). Both palettes are defined in theme.css under
 * [data-theme="light"|"dark"] — this context just flips the attribute on
 * <html> and remembers the choice, the same pattern as LanguageContext.
 */
const STORAGE_KEY = "rakaez_visual_theme";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore (e.g. private browsing storage restrictions)
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((th) => (th === "light" ? "dark" : "light"));
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
