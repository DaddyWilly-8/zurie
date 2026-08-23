"use client";

import type { PropsWithChildren } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { AppThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SettingsProvider } from "@/providers/settings-provider";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <AppRouterCacheProvider>
      <QueryProvider>
        <AppThemeProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </AppThemeProvider>
      </QueryProvider>
    </AppRouterCacheProvider>
  );
};
