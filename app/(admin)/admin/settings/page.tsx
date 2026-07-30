import { Stack, Typography } from "@mui/material";
import { AdminSettingsClient } from "@/features/admin/admin-settings-client";

export default function AdminSettingsPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Website Settings</Typography>
      <AdminSettingsClient />
    </Stack>
  );
}
