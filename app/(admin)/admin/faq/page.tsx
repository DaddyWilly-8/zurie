import { AdminFaqClient } from "@/features/admin/admin-faq-client";
import { Stack, Typography } from "@mui/material";

export default function AdminFaqPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">FAQ Management</Typography>
      <AdminFaqClient />
    </Stack>
  );
}