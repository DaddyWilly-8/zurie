import Link from "next/link";
import { Button, Stack, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Stack spacing={2} alignItems="flex-start" sx={{ py: 8 }}>
      <Typography variant="h3">Page not found</Typography>
      <Typography color="text.secondary">
        The page you requested does not exist.
      </Typography>
      <Link href="/">
        <Button variant="contained">Back Home</Button>
      </Link>
    </Stack>
  );
}
