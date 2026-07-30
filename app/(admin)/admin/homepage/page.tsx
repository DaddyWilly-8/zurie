import { Stack, Typography } from "@mui/material";
import {
  AdminHomepageClient,
} from "@/features/admin/admin-homepage-client";

export default function AdminHomepagePage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Homepage Management</Typography>
      <AdminHomepageClient initialData={null} />
    </Stack>
  );
}
