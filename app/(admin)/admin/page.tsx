import { Stack, Typography } from "@mui/material";
import { AdminOverviewClient } from "@/features/admin/admin-overview-client";

export default function AdminPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Dashboard Overview</Typography>
      <AdminOverviewClient />
    </Stack>
  );
}
