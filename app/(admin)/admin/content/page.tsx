import { Stack, Typography } from "@mui/material";
import { AdminContentClient } from "@/features/admin/admin-content-client";

export default function AdminContentPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Content Management</Typography>
      <AdminContentClient />
    </Stack>
  );
}
