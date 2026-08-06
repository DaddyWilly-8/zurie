import { Stack, Typography } from "@mui/material";
import {
  AdminOrdersClient,
} from "@/features/admin/admin-orders-client";

export default function AdminOrdersPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Order Management</Typography>
      <AdminOrdersClient />
    </Stack>
  );
}
