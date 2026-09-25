"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button, Stack, Typography } from "@mui/material";

// Catches errors thrown in the root layout itself, which app/error.tsx
// can't — Next.js requires this file to render its own <html>/<body>
// since the real root layout is what crashed.
export default function GlobalError({
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
    <html>
      <body>
        <Stack spacing={2} sx={{ py: 8, px: 3, textAlign: "center" }}>
          <Typography variant="h3">Something went wrong</Typography>
          <Typography color="text.secondary">
            Please retry or contact support if this continues.
          </Typography>
          <Button
            variant="contained"
            onClick={reset}
            sx={{ alignSelf: "center" }}
          >
            Retry
          </Button>
        </Stack>
      </body>
    </html>
  );
}
