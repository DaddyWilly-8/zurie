import { Stack, Typography } from "@mui/material";
import { AdminActivityClient } from "@/features/admin/activity";

export default function AdminActivityPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Admin Activity Logs</Typography>
      <AdminActivityClient />
    </Stack>
  );
}
