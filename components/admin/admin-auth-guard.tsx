"use client";

import { CircularProgress, Stack, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export const AdminAuthGuard = ({ children }: PropsWithChildren) => {
  const { loading, user } = useAdminAuth();

  if (loading || !user) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1.5}
        sx={{ minHeight: "65vh" }}
      >
        <CircularProgress size={28} />
        <Typography color="text.secondary">Checking admin session...</Typography>
      </Stack>
    );
  }

  return <>{children}</>;
};
