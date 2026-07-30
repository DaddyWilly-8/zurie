"use client";

import type { PropsWithChildren } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { AppThemeProvider } from "@/providers/theme-provider";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <AppRouterCacheProvider>
      <AppThemeProvider>{children}</AppThemeProvider>
    </AppRouterCacheProvider>
  );
};
