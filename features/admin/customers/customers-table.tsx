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
  Chip,
} from "@mui/material";
import type { AdminCustomerRow } from "./types";

type Props = {
  rows: AdminCustomerRow[];
  onView: (id: string) => void;
};

const getCreatedAt = (row: AdminCustomerRow) =>
  row.created_at ?? row.createdAt ?? "";

export const CustomersTable = ({ rows, onView }: Props) => {
  return (
    <Card
      sx={{
        overflowX: "auto",
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        borderRadius: 1,
      }}
    >
      <Table sx={{ minWidth: 700 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8f6f2" }}>
            <TableCell
              sx={{
                fontWeight: 600,
                letterSpacing: "0.24em",
                fontSize: "0.65rem",
                color: "text.secondary",
              }}
            >
              Customer
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                letterSpacing: "0.24em",
                fontSize: "0.65rem",
                color: "text.secondary",
              }}
            >
              Phone
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                letterSpacing: "0.24em",
                fontSize: "0.65rem",
                color: "text.secondary",
              }}
            >
              Created
            </TableCell>
            <TableCell
              align="right"
              sx={{
                fontWeight: 600,
                letterSpacing: "0.24em",
                fontSize: "0.65rem",
                color: "text.secondary",
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Typography fontWeight={600} sx={{ color: "#171512" }}>
                  {row.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={row.phone ?? "-"}
                  size="small"
                  sx={{
                    fontSize: "0.6rem",
                    bgcolor: "#f0ebe3",
                    color: "#171512",
                    fontWeight: 500,
                  }}
                />
              </TableCell>
              <TableCell>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem" }}
                >
                  {getCreatedAt(row)
                    ? new Date(getCreatedAt(row)).toLocaleDateString()
                    : "-"}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onView(row.id)}
                  sx={{
                    borderRadius: 0,
                    textTransform: "none",
                    borderColor: "#e9e2d8",
                    color: "#171512",
                    fontSize: "0.65rem",
                    "&:hover": {
                      borderColor: "#171512",
                      bgcolor: "#f8f6f2",
                    },
                  }}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No customers found.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Card>
  );
};
