"use client";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import type { PropsWithChildren } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#b58a57" },
    secondary: { main: "#111111" },
    background: { default: "#f8f5f0", paper: "#ffffff" },
    text: { primary: "#1b1b1b", secondary: "#5d5a55" },
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
  },
});

export const AppThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
