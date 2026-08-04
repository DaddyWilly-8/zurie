"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Card,
  CardContent,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import {
  userActions,
  UsersTable,
  type AdminUserRow,
  type UserRole,
} from "@/features/admin/users";

export const AdminUsersClient = ({ initialData }: { initialData: AdminUserRow[] }) => {
  const USERS_PAGE_SIZE = 10;
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: rows = initialData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: userActions.list,
    initialData: initialData.length > 0 ? initialData : undefined,
  });

  const updateRole = async (id: string, role: UserRole) => {
    try {
      await userActions.updateRole(id, role);
    } catch {
      setMessage("Failed to update role");
      return;
    }

    setMessage("Role updated");
    await refetch();
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(rows.length / USERS_PAGE_SIZE)),
    [rows.length],
  );

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * USERS_PAGE_SIZE;
    return rows.slice(start, start + USERS_PAGE_SIZE);
  }, [rows, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <Stack spacing={3}>
      {message ? <Alert severity="info" onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>{message}</Alert> : null}
      <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
              Users
            </Typography>
            <Typography variant="h6" sx={{ color: "text.primary" }}>
              {isLoading ? "Loading admin users..." : "Admin Users & Roles"}
            </Typography>
          </Stack>
          {isError ? (
            <Typography color="error.main" sx={{ py: 2 }}>
              Failed to load users.
            </Typography>
          ) : null}
          <UsersTable rows={paginatedRows} onRoleChange={updateRole} />
          {rows.length > USERS_PAGE_SIZE ? (
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          ) : null}
      </CardContent>
      </Card>
    </Stack>
  );
};
