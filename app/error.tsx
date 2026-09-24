"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button, Stack, Typography } from "@mui/material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <Stack spacing={2} sx={{ py: 8 }}>
      <Typography variant="h3">Something went wrong</Typography>
      <Typography color="text.secondary">
        Please retry or contact support if this continues.
      </Typography>
      <Button variant="contained" onClick={reset}>
        Retry
      </Button>
    </Stack>
  );
}
