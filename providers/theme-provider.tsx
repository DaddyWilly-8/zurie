"use client";

import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  type PaletteMode,
} from "@mui/material";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type ThemeModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const THEME_MODE_KEY = "zurie_theme_mode";

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

const getInitialMode = (): PaletteMode => {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(THEME_MODE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setMode] = useState<PaletteMode>("light");

  useEffect(() => {
    setMode(getInitialMode());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_MODE_KEY, mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: mode === "light" ? "#b58a57" : "#d6b487" },
          secondary: { main: mode === "light" ? "#111111" : "#e9dfcf" },
          background:
            mode === "light"
              ? { default: "#f8f5f0", paper: "#ffffff" }
              : { default: "#12110f", paper: "#1a1917" },
          text:
            mode === "light"
              ? { primary: "#1b1b1b", secondary: "#5d5a55" }
              : { primary: "#f3eee4", secondary: "#b6aea2" },
        },
        typography: {
          fontFamily: "var(--font-manrope), sans-serif",
          h1: { fontFamily: "var(--font-playfair), serif", fontWeight: 600 },
          h2: { fontFamily: "var(--font-playfair), serif", fontWeight: 600 },
          h3: { fontFamily: "var(--font-playfair), serif", fontWeight: 600 },
          h4: { fontFamily: "var(--font-playfair), serif", fontWeight: 600 },
        },
        shape: {
          borderRadius: 18,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
              },
            },
          },
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: "background-color 180ms ease, color 180ms ease",
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within AppThemeProvider");
  }
  return context;
};
