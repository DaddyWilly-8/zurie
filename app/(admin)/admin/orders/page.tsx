import { Stack, Typography } from "@mui/material";
import { AdminOrdersClient } from "@/features/admin/orders";

export default function AdminOrdersPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Order Management</Typography>
      <AdminOrdersClient />
    </Stack>
  );
}
