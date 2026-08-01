"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
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
  const [rows, setRows] = useState(initialData);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await userActions.list();
        if (active) {
          setRows(payload);
        }
      } catch {
        if (active) {
          setMessage("Failed to load users");
        }
      }
    };

    if (initialData.length === 0) {
      void load();
    }

    return () => {
      active = false;
    };
  }, [initialData]);

  const updateRole = async (id: string, role: UserRole) => {
    try {
      await userActions.updateRole(id, role);
    } catch {
      setMessage("Failed to update role");
      return;
    }

    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, role } : row)));
    setMessage("Role updated");
  };

  return (
    <Stack spacing={3}>
      {message ? <Alert severity="info" onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>{message}</Alert> : null}
      <Card sx={{ border: "1px solid #ebe2d5", boxShadow: "none", bgcolor: "#fbf8f3" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "#aa8d66" }}>
              Users
            </Typography>
            <Typography variant="h6" sx={{ color: "#171512" }}>
              Admin Users & Roles
            </Typography>
          </Stack>
          <UsersTable rows={rows} onRoleChange={updateRole} />
      </CardContent>
      </Card>
    </Stack>
  );
};
