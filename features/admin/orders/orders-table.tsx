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
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Grid,
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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";
  const getCardBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper";
  const getHoverBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "action.hover";

  const getAvailableStatuses = (currentStatus: string): string[] => {
    if (TERMINAL_STATUSES.includes(currentStatus)) {
      return [];
    }

    const currentIndex = ALL_STATUSES.indexOf(currentStatus);
    return ALL_STATUSES.slice(currentIndex);
  };

  const isTerminalStatus = (status: string): boolean => {
    return TERMINAL_STATUSES.includes(status);
  };

  const isStatusBeforeCurrent = (
    status: string,
    currentStatus: string,
  ): boolean => {
    const statusIndex = ALL_STATUSES.indexOf(status);
    const currentIndex = ALL_STATUSES.indexOf(currentStatus);
    return statusIndex < currentIndex;
  };

  // Mobile card layout
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {rows.map((row) => {
          const availableStatuses = getAvailableStatuses(row.status);
          const isTerminal = isTerminalStatus(row.status);

          return (
            <Paper
              key={row.id}
              sx={{
                p: 2.5,
                border: `1px solid ${getBorderColor()}`,
                bgcolor: getCardBackground(),
                borderRadius: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: getTextColor(),
                  bgcolor: getHoverBackgroundColor(),
                },
              }}
            >
              <Stack spacing={2}>
                {/* Order Header */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      fontWeight={600}
                      sx={{ color: getTextColor(), fontSize: "0.95rem" }}
                    >
                      Order #{row.order_number}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getSecondaryTextColor(),
                        fontSize: "0.65rem",
                      }}
                    >
                      {new Date(row.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={STATUS_LABELS[row.status] || row.status}
                    size="small"
                    color={STATUS_COLORS[row.status] || "default"}
                    sx={{
                      fontSize: "0.55rem",
                      fontWeight: 500,
                      minWidth: 60,
                    }}
                  />
                </Stack>

                <Divider sx={{ borderColor: getBorderColor() }} />

                {/* Customer Info */}
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getSecondaryTextColor(),
                        fontSize: "0.55rem",
                      }}
                    >
                      Customer
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: getTextColor(), fontWeight: 500 }}
                    >
                      {row.customer_name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getSecondaryTextColor(),
                        fontSize: "0.55rem",
                      }}
                    >
                      WhatsApp
                    </Typography>
                    <Typography variant="body2" sx={{ color: getTextColor() }}>
                      {row.whatsapp_number || "-"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getSecondaryTextColor(),
                        fontSize: "0.55rem",
                      }}
                    >
                      Phone
                    </Typography>
                    <Typography variant="body2" sx={{ color: getTextColor() }}>
                      {row.customer_phone || "No phone"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getSecondaryTextColor(),
                        fontSize: "0.55rem",
                      }}
                    >
                      Total
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: getTextColor(), fontWeight: 600 }}
                    >
                      {formatBaseCurrencyInCurrency(
                        row.total_amount,
                        currency,
                        rates,
                      )}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ borderColor: getBorderColor() }} />

                {/* Status Update */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {!isTerminal && availableStatuses.length > 0 ? (
                    <TextField
                      select
                      size="small"
                      value={row.status}
                      onChange={(event) => {
                        if (event.target.value !== row.status) {
                          onStatusChange(row.order_number, event.target.value);
                        }
                      }}
                      fullWidth
                      sx={{
                        "& .MuiSelect-select": {
                          fontSize: "0.75rem",
                        },
                        "& .MuiOutlinedInput-root": {
                          bgcolor: getCardBackground(),
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
                    <Typography
                      variant="caption"
                      sx={{
                        color: getSecondaryTextColor(),
                        fontStyle: "italic",
                      }}
                    >
                      {row.status === "delivered"
                        ? "✅ Delivered"
                        : row.status === "cancelled"
                          ? "❌ Cancelled"
                          : "No updates available"}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>
          );
        })}

        {rows.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ color: getSecondaryTextColor() }}>
              No orders found.
            </Typography>
          </Box>
        ) : null}
      </Stack>
    );
  }

  // Tablet and Desktop table view
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
