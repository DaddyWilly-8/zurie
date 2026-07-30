"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { userService } from "@/services/users/user.service";

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  role: "super_admin" | "admin" | "staff";
  created_at: string;
};

export const AdminUsersClient = ({ initialData }: { initialData: AdminUserRow[] }) => {
  const [rows, setRows] = useState(initialData);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const payload = await userService.listUsers();
        if (active) {
          setRows(payload as AdminUserRow[]);
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

  const updateRole = async (id: string, role: AdminUserRow["role"]) => {
    try {
      await userService.updateRole(id, role);
    } catch {
      setMessage("Failed to update role");
      return;
    }

    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, role } : row)));
    setMessage("Role updated");
  };

  return (
    <Stack spacing={2}>
      {message ? <Alert severity="info">{message}</Alert> : null}
      <Paper sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Typography fontWeight={600}>{row.full_name ?? row.id}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    select
                    value={row.role}
                    onChange={(event) =>
                      updateRole(row.id, event.target.value as AdminUserRow["role"])
                    }
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value="super_admin">Super Admin</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No admin users found.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
};
