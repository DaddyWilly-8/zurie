import {
  Card,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { AdminUserRow, UserRole } from "./types";

type Props = {
  rows: AdminUserRow[];
  roleOptions: UserRole[];
  onRoleChange: (id: string, role: UserRole, roleIds?: number[]) => void;
};

const formatRoleLabel = (role: UserRole) => {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Staff";
};

export const UsersTable = ({ rows, roleOptions, onRoleChange }: Props) => {
  return (
    <Card sx={{ overflowX: "auto", boxShadow: "none", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover" }}>
            <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
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
                  onChange={(event) => onRoleChange(row.id, event.target.value as UserRole, row.roleIds)}
                  sx={{ minWidth: 180, bgcolor: "background.paper" }}
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role} value={role}>{formatRoleLabel(role)}</MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}

          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No admin users found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
};
