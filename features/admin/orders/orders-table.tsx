import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import { useState } from "react";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import type { AdminOrderRow } from "./types";

type Props = {
  rows: AdminOrderRow[];
  onStatusChange: (id: string, nextStatus: string) => Promise<void>;
  onCancelOrder?: (id: string) => Promise<void>;
};

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
  "primary" | "success" | "warning" | "error" | "info" | "default"
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

// Status descriptions for confirmation dialog
const STATUS_DESCRIPTIONS: Record<string, string> = {
  confirmed: "This will confirm the order and begin processing.",
  processing: "This will mark the order as being processed.",
  ready_for_delivery: "This will mark the order as ready for delivery.",
  delivered:
    "This will mark the order as delivered. This action is final and cannot be undone.",
  cancelled:
    "This will cancel the order. This action is final and cannot be undone.",
};

// Allowed status transitions (only the next valid status)
const STATUS_TRANSITIONS: Record<string, string> = {
  new: "confirmed",
  confirmed: "processing",
  processing: "ready_for_delivery",
  ready_for_delivery: "delivered",
};

// Statuses where cancellation is allowed
const CANCELLABLE_STATUSES = [
  "new",
  "confirmed",
  "processing",
  "ready_for_delivery",
];

export const OrdersTable = ({ rows, onStatusChange, onCancelOrder }: Props) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"status" | "cancel">("status");
  const [pendingOrderId, setPendingOrderId] = useState<string>("");
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [pendingCurrentStatus, setPendingCurrentStatus] = useState<string>("");

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("error");

  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";
  const getCardBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper";
  const getHoverBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "action.hover";

  // Get the valid next status for an order
  const getNextValidStatus = (currentStatus: string): string | null => {
    if (TERMINAL_STATUSES.includes(currentStatus)) {
      return null;
    }
    return STATUS_TRANSITIONS[currentStatus] || null;
  };

  const isTerminalStatus = (status: string): boolean => {
    return TERMINAL_STATUSES.includes(status);
  };

  const canCancelOrder = (status: string): boolean => {
    return CANCELLABLE_STATUSES.includes(status);
  };

  const handleStatusChange = (
    orderId: string,
    currentStatus: string,
    newStatus: string,
  ) => {
    // Prevent changing to the same status
    if (currentStatus === newStatus) {
      return;
    }

    // Check if this is a valid transition
    const nextValid = getNextValidStatus(currentStatus);
    if (nextValid && newStatus !== nextValid) {
      const errorMsg = `Order cannot move from '${currentStatus}' to '${newStatus}'. The only allowed next status is '${nextValid}'.`;
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setDialogType("status");
    setPendingOrderId(orderId);
    setPendingStatus(newStatus);
    setPendingCurrentStatus(currentStatus);
    setDialogOpen(true);
  };

  const handleCancelOrder = (orderId: string, currentStatus: string) => {
    if (!canCancelOrder(currentStatus)) {
      setSnackbarMessage(
        `Order cannot be cancelled from '${currentStatus}' status.`,
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setDialogType("cancel");
    setPendingOrderId(orderId);
    setPendingStatus("cancelled");
    setPendingCurrentStatus(currentStatus);
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingOrderId) return;

    try {
      if (dialogType === "cancel") {
        if (onCancelOrder) {
          await onCancelOrder(pendingOrderId);
          setSnackbarMessage("Order cancelled successfully.");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage("Cancel order functionality is not available.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        }
      } else if (dialogType === "status" && pendingStatus) {
        await onStatusChange(pendingOrderId, pendingStatus);
        setSnackbarMessage(
          `Order status updated to ${STATUS_LABELS[pendingStatus]}`,
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to perform action. Please try again.";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }

    setDialogOpen(false);
    setPendingOrderId("");
    setPendingStatus("");
    setPendingCurrentStatus("");
  };

  const handleCancelAction = () => {
    setDialogOpen(false);
    setPendingOrderId("");
    setPendingStatus("");
    setPendingCurrentStatus("");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Mobile card layout
  if (isMobile) {
    return (
      <>
        <Stack spacing={2}>
          {rows.map((row) => {
            const isTerminal = isTerminalStatus(row.status);
            const nextStatus = getNextValidStatus(row.status);
            const hasValidTransition = nextStatus !== null;
            const cancellable = canCancelOrder(row.status);

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
                      <Typography
                        variant="body2"
                        sx={{ color: getTextColor() }}
                      >
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
                      <Typography
                        variant="body2"
                        sx={{ color: getTextColor() }}
                      >
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

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    {!isTerminal && hasValidTransition && (
                      <Button
                        variant="contained"
                        size="small"
                        color={
                          STATUS_COLORS[nextStatus] as
                            | "primary"
                            | "secondary"
                            | "error"
                            | "info"
                            | "success"
                            | "warning"
                        }
                        onClick={() =>
                          handleStatusChange(
                            row.order_number,
                            row.status,
                            nextStatus,
                          )
                        }
                        fullWidth
                        sx={{
                          textTransform: "none",
                          borderRadius: 1,
                          fontSize: "0.7rem",
                          flex: 1,
                        }}
                      >
                        Move to {STATUS_LABELS[nextStatus]}
                      </Button>
                    )}
                    {cancellable && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() =>
                          handleCancelOrder(row.order_number, row.status)
                        }
                        fullWidth={!hasValidTransition}
                        sx={{
                          textTransform: "none",
                          borderRadius: 1,
                          fontSize: "0.7rem",
                          flex: hasValidTransition ? 0.5 : 1,
                          borderColor: "error.main",
                          color: "error.main",
                          "&:hover": {
                            borderColor: "error.dark",
                            bgcolor: isDarkMode
                              ? "rgba(244,67,54,0.15)"
                              : "#fce4ec",
                          },
                        }}
                      >
                        Cancel Order
                      </Button>
                    )}
                    {isTerminal && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: getSecondaryTextColor(),
                          fontStyle: "italic",
                          textAlign: "center",
                          width: "100%",
                          py: 1,
                        }}
                      >
                        {row.status === "delivered"
                          ? "✅ Delivered"
                          : row.status === "cancelled"
                            ? "❌ Cancelled"
                            : "Complete"}
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

        {/* Confirmation Dialog */}
        <ActionConfirmationDialog
          open={dialogOpen}
          onClose={handleCancelAction}
          onConfirm={handleConfirmAction}
          type={dialogType}
          status={pendingStatus}
          currentStatus={pendingCurrentStatus}
          isDarkMode={isDarkMode}
        />

        {/* Snackbar for errors/success */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Tablet and Desktop table view
  return (
    <>
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
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isTerminal = isTerminalStatus(row.status);
              const nextStatus = getNextValidStatus(row.status);
              const hasValidTransition = nextStatus !== null;
              const cancellable = canCancelOrder(row.status);

              return (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{row.order_number}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {row.customer_name}
                    </Typography>
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
                    {new Date(row.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {!isTerminal && hasValidTransition && (
                        <Button
                          variant="contained"
                          size="small"
                          color={
                            STATUS_COLORS[nextStatus] as
                              | "primary"
                              | "secondary"
                              | "error"
                              | "info"
                              | "success"
                              | "warning"
                          }
                          onClick={() =>
                            handleStatusChange(
                              row.order_number,
                              row.status,
                              nextStatus,
                            )
                          }
                          sx={{
                            textTransform: "none",
                            borderRadius: 1,
                            fontSize: "0.65rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          → {STATUS_LABELS[nextStatus]}
                        </Button>
                      )}
                      {cancellable && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() =>
                            handleCancelOrder(row.order_number, row.status)
                          }
                          sx={{
                            textTransform: "none",
                            borderRadius: 1,
                            fontSize: "0.65rem",
                            whiteSpace: "nowrap",
                            borderColor: "error.main",
                            color: "error.main",
                            "&:hover": {
                              borderColor: "error.dark",
                              bgcolor: isDarkMode
                                ? "rgba(244,67,54,0.15)"
                                : "#fce4ec",
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      {isTerminal && (
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
                              : "Complete"}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
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

      {/* Confirmation Dialog */}
      <ActionConfirmationDialog
        open={dialogOpen}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        type={dialogType}
        status={pendingStatus}
        currentStatus={pendingCurrentStatus}
        isDarkMode={isDarkMode}
      />

      {/* Snackbar for errors/success */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

// Action Confirmation Dialog Component
const ActionConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  type,
  status,
  currentStatus,
  isDarkMode,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "status" | "cancel";
  status: string;
  currentStatus: string;
  isDarkMode: boolean;
}) => {
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getDialogBackground = () => (isDarkMode ? "#1e1e1e" : "#ffffff");
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";

  const isCancel = type === "cancel";
  const isTerminal = status === "delivered" || status === "cancelled";
  const statusLabel = STATUS_LABELS[status] || status;
  const currentStatusLabel = STATUS_LABELS[currentStatus] || currentStatus;
  const statusColor = STATUS_COLORS[status] || "primary";
  const description = isCancel
    ? "This will cancel the order and restock the items. This action is final and cannot be undone."
    : STATUS_DESCRIPTIONS[status] || "Update the order status.";
  const title = isCancel ? "Cancel Order" : "Update Order Status";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
          bgcolor: getDialogBackground(),
          border: `1px solid ${getBorderColor()}`,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Chip
          label={isCancel ? "Cancel" : statusLabel}
          size="medium"
          color={isCancel ? "error" : statusColor}
          sx={{ fontWeight: 600, fontSize: "0.8rem" }}
        />
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ color: getTextColor() }}
        >
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, color: getSecondaryTextColor() }}>
          {isCancel ? (
            <>
              Are you sure you want to cancel order from{" "}
              <strong style={{ color: getTextColor() }}>
                {currentStatusLabel}
              </strong>
              ?
            </>
          ) : (
            <>
              Are you sure you want to update the order status from{" "}
              <strong style={{ color: getTextColor() }}>
                {currentStatusLabel}
              </strong>{" "}
              to{" "}
              <strong style={{ color: getTextColor() }}>{statusLabel}</strong>?
            </>
          )}
        </DialogContentText>
        <Box
          sx={{
            p: 2,
            bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2",
            borderRadius: 1,
            border: `1px solid ${getBorderColor()}`,
          }}
        >
          <Typography variant="body2" sx={{ color: getTextColor() }}>
            {description}
          </Typography>
          {(isTerminal || isCancel) && (
            <Typography
              variant="caption"
              sx={{
                color: "error.main",
                display: "block",
                mt: 1,
                fontWeight: 500,
              }}
            >
              ⚠️ This action is final and cannot be undone.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: getSecondaryTextColor(),
            "&:hover": {
              bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "action.hover",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isCancel ? "error" : "primary"}
          sx={{
            textTransform: "none",
          }}
        >
          {isCancel ? "Confirm Cancel" : "Confirm Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
