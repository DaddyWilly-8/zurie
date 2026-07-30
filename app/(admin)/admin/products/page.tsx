import { Stack, Typography } from "@mui/material";
import { AdminProductsClient } from "@/features/admin/admin-products-client";

export default function AdminProductsPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Product Management</Typography>
      <AdminProductsClient />
    </Stack>
  );
}
