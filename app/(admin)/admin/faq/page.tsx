import { AdminFaqClient } from "@/features/admin/faq";
import { Stack, Typography } from "@mui/material";

export default function AdminFaqPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">FAQ Management</Typography>
      <AdminFaqClient />
    </Stack>
  );
}
