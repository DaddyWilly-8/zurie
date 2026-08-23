import { Stack, Typography } from "@mui/material";
import { AdminCustomersClient } from "@/features/admin/customers";

export default function AdminCustomersPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Customers</Typography>
      <AdminCustomersClient />
    </Stack>
  );
}
