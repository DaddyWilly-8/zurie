import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { AdminCustomerRow } from "./types";

type Props = {
  rows: AdminCustomerRow[];
  onView: (id: string) => void;
};

const getCreatedAt = (row: AdminCustomerRow) => row.created_at ?? row.createdAt ?? "";

export const CustomersTable = ({ rows, onView }: Props) => {
  return (
    <Card sx={{ overflowX: "auto", boxShadow: "none", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Table sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover" }}>
            <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography fontWeight={600}>{row.name ?? "Unknown Customer"}</Typography>
                <Typography variant="caption" color="text.secondary">ID: {row.id}</Typography>
              </TableCell>
              <TableCell>{row.email ?? "-"}</TableCell>
              <TableCell>{row.phone ?? "-"}</TableCell>
              <TableCell>
                {getCreatedAt(row) ? new Date(getCreatedAt(row)).toLocaleString() : "-"}
              </TableCell>
              <TableCell align="right">
                <Button size="small" variant="outlined" onClick={() => onView(row.id)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">No customers found.</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
};
