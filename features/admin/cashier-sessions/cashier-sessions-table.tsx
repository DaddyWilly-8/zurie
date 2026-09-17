import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { CashierSession } from "./types";

type Props = {
  items: CashierSession[];
};

export const CashierSessionsTable = ({ items }: Props) => {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Outlet</TableCell>
            <TableCell>Opened</TableCell>
            <TableCell>Closed</TableCell>
            <TableCell>Opening</TableCell>
            <TableCell>Closing</TableCell>
            <TableCell>Variance</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>Outlet #{item.outletId}</TableCell>
              <TableCell>{new Date(item.openedAt).toLocaleString()}</TableCell>
              <TableCell>
                {item.closedAt ? new Date(item.closedAt).toLocaleString() : "—"}
              </TableCell>
              <TableCell>{item.openingBalance.toLocaleString()}</TableCell>
              <TableCell>
                {item.closingBalance !== null
                  ? item.closingBalance.toLocaleString()
                  : "—"}
              </TableCell>
              <TableCell>
                {item.variance !== null ? (
                  <Typography
                    component="span"
                    color={
                      item.variance === 0
                        ? "text.primary"
                        : item.variance > 0
                          ? "success.main"
                          : "error.main"
                    }
                  >
                    {item.variance > 0 ? "+" : ""}
                    {item.variance.toLocaleString()}
                  </Typography>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={item.status === "open" ? "Open" : "Closed"}
                  color={item.status === "open" ? "warning" : "default"}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
