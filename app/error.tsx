"use client";

import { Button, Stack, Typography } from "@mui/material";

export default function Error({ reset }: { error: Error; reset: () => void }) {
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
