import { Stack, Typography } from "@mui/material";
import { AdminSettingsClient } from "@/features/admin/settings";

export default function AdminSettingsPage() {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Website Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage contact info, brand content, and homepage hero/banner settings.
        </Typography>
      </Stack>
      <AdminSettingsClient />
    </Stack>
  );
}
