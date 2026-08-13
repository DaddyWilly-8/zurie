import {
  Box,
  Chip,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import type { AdminOrderRow } from "./types";

type Props = {
  rows: AdminOrderRow[];
  onStatusChange: (id: string, nextStatus: string) => void;
};

// All possible statuses in order
const ALL_STATUSES = [
  "new",
  "confirmed",
  "processing",
  "ready_for_delivery",
  "delivered",
  "cancelled",
];

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  ready_for_delivery: "Ready for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<
  string,
  "default" | "primary" | "success" | "warning" | "error" | "info"
> = {
  new: "primary",
  confirmed: "info",
  processing: "warning",
  ready_for_delivery: "success",
  delivered: "success",
  cancelled: "error",
};

// Statuses that are terminal (no further changes)
const TERMINAL_STATUSES = ["delivered", "cancelled"];

export const OrdersTable = ({ rows, onStatusChange }: Props) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  const getAvailableStatuses = (currentStatus: string): string[] => {
    // If terminal, no statuses available
    if (TERMINAL_STATUSES.includes(currentStatus)) {
      return [];
    }

    const currentIndex = ALL_STATUSES.indexOf(currentStatus);
    // Return all statuses from current position to the end
    // Including current status so they can keep it same
    return ALL_STATUSES.slice(currentIndex);
  };

  const isTerminalStatus = (status: string): boolean => {
    return TERMINAL_STATUSES.includes(status);
  };

  // Helper to check if a status is before the current one (should be disabled)
  const isStatusBeforeCurrent = (
    status: string,
    currentStatus: string,
  ): boolean => {
    const statusIndex = ALL_STATUSES.indexOf(status);
    const currentIndex = ALL_STATUSES.indexOf(currentStatus);
    return statusIndex < currentIndex;
  };

  return (
    <Box
      sx={{
        overflowX: "auto",
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "action.hover" }}>
            <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>WhatsApp</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const availableStatuses = getAvailableStatuses(row.status);
            const isTerminal = isTerminalStatus(row.status);

            return (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{row.order_number}</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{row.customer_name}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {row.customer_phone || "No phone"}
                  </Typography>
                </TableCell>
                <TableCell>{row.whatsapp_number || "-"}</TableCell>
                <TableCell>
                  {formatBaseCurrencyInCurrency(
                    row.total_amount,
                    currency,
                    rates,
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {!isTerminal && availableStatuses.length > 0 ? (
                      <TextField
                        select
                        size="small"
                        value={row.status}
                        onChange={(event) => {
                          if (event.target.value !== row.status) {
                            onStatusChange(
                              row.order_number,
                              event.target.value,
                            );
                          }
                        }}
                        sx={{
                          minWidth: 160,
                          bgcolor: "background.paper",
                          "& .MuiSelect-select": {
                            fontSize: "0.75rem",
                          },
                        }}
                      >
                        {availableStatuses.map((status) => {
                          const isBeforeCurrent = isStatusBeforeCurrent(
                            status,
                            row.status,
                          );
                          return (
                            <MenuItem
                              key={status}
                              value={status}
                              disabled={isBeforeCurrent}
                              sx={{
                                color: isBeforeCurrent
                                  ? "text.disabled"
                                  : "inherit",
                                opacity: isBeforeCurrent ? 0.5 : 1,
                              }}
                            >
                              {STATUS_LABELS[status] || status}
                              {status === row.status && " ✓"}
                              {isBeforeCurrent && " (locked)"}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    ) : (
                      <Chip
                        label={STATUS_LABELS[row.status] || row.status}
                        size="small"
                        color={STATUS_COLORS[row.status] || "default"}
                        sx={{
                          fontSize: "0.6rem",
                          fontWeight: 500,
                          minWidth: 60,
                        }}
                      />
                    )}
                    {isTerminal && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: "italic", ml: 1 }}
                      >
                        {row.status === "delivered"
                          ? "✅ Delivered"
                          : "❌ Cancelled"}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  {new Date(row.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}

          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No orders found.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Box>
  );
};
