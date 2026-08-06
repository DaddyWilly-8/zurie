import { Stack, Typography } from "@mui/material";
import {
  AdminUsersClient,
} from "@/features/admin/admin-users-client";

export default function AdminUsersPage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Admin Users & Roles</Typography>
      <AdminUsersClient />
    </Stack>
  );
}
