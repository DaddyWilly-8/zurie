import { Stack, Typography } from "@mui/material";
import { AdminEnquiriesClient } from "@/features/admin/enquiries";

export default function AdminEnquiriesPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Customer Enquiries</Typography>
      <AdminEnquiriesClient />
    </Stack>
  );
}
