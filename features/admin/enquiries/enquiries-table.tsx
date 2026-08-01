import {
  Box,
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
import type { AdminEnquiryRow } from "./types";

type EnquiriesTableProps = {
  rows: AdminEnquiryRow[];
  onStatusChange: (id: string, status: string) => void;
};

export const EnquiriesTable = ({ rows, onStatusChange }: EnquiriesTableProps) => {
  return (
    <Card sx={{ overflowX: "auto", boxShadow: "none", border: "1px solid #e9e2d8" }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8f6f2" }}>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography fontWeight={500}>{row.name}</Typography>
              </TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.phone ?? "-"}</TableCell>
              <TableCell sx={{ maxWidth: 320 }}>{row.message}</TableCell>
              <TableCell>
                <TextField
                  select
                  size="small"
                  value={row.status}
                  onChange={(event) => onStatusChange(row.id, event.target.value)}
                  sx={{ minWidth: 160, bgcolor: "#ffffff" }}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="responded">Responded</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </TextField>
              </TableCell>
              <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary">No enquiries found.</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
};
