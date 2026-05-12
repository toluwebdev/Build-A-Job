import React, { createContext, useContext } from "react";

type ThemeContextValue = Record<string, never>;

const ThemeContext = createContext<ThemeContextValue>({});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{}}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
