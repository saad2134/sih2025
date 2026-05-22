"use client";

import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from "next-themes";
import { useEffect, useState, createContext, useContext } from "react";

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prevent any rendering until mounted
  if (!mounted) return null;

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="theme" // saves selection in localStorage automatically
    >
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </NextThemeProvider>
  );
}

function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme();
  return (
    <ThemeContext.Provider value={{ theme: theme ?? "system", setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
