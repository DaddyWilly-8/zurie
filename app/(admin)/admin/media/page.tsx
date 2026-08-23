import { Stack, Typography } from "@mui/material";
import { AdminMediaLibraryClient } from "@/features/admin/media";

export default function AdminMediaPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Media Library</Typography>
      <AdminMediaLibraryClient />
    </Stack>
  );
}
