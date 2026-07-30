import { Stack, Typography } from "@mui/material";
import { AdminCategoriesClient } from "@/features/admin/admin-categories-client";

export default function AdminCategoriesPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Category Management</Typography>
      <AdminCategoriesClient />
    </Stack>
  );
}
