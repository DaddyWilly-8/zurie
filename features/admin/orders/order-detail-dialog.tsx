"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import {
  orderService,
  type OrderResponse,
} from "@/services/orders/order.service";
import { OrderReceiptsTab } from "./order-receipts-tab";
import { OrderDeliveryTab } from "./order-delivery-tab";

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  ready_for_delivery: "Ready for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<
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

type OrderDetailDialogProps = {
  orderNumber: string | null;
  onClose: () => void;
  isDarkMode: boolean;
};

// Full order detail — GET /admin/orders/{orderNumber}, including line items,
// which the trimmed GET /admin/orders list response never carries. Shared
// between the orders table and the dashboard's "Recent Orders" panel.
// Tabbed: Invoice (the original single-view content) / Receipts (payments
// applied against this order's AR, via Phase G's receipt_order link) /
// Delivery (dispatch history + a form to record a new one) — the "instant
// sale vs. delivery customer" brainstorm's tab structure.
export const OrderDetailDialog = ({
  orderNumber,
  onClose,
  isDarkMode,
}: OrderDetailDialogProps) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  // Negotiated-price adjustment form — see OrderService::adjustPrice()'s
  // docblock on the backend for why this only ever lowers the total and
  // requires a reason.
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getDialogBackground = () => (isDarkMode ? "#1e1e1e" : "#ffffff");
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";

  useEffect(() => {
    if (!orderNumber) {
      setOrder(null);
      setError(null);
      setTab(0);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    orderService
      .getOrder(orderNumber)
      .then((response) => {
        if (active) setOrder(response.data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load order.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [orderNumber]);

  const isTerminal =
    order?.status === "delivered" || order?.status === "cancelled";

  const handleAdjustSubmit = async () => {
    if (!order) return;

    const amount = Number(adjustAmount);
    setAdjustError(null);

    if (!Number.isFinite(amount) || amount <= 0) {
      setAdjustError("Enter a valid amount.");
      return;
    }
    if (amount >= order.totalAmount) {
      setAdjustError(
        `The new amount must be lower than the current total (${order.totalAmount}).`,
      );
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustError("A reason is required.");
      return;
    }

    setAdjustSubmitting(true);
    try {
      await orderService.adjustOrderPrice(
        order.orderNumber,
        amount,
        adjustReason.trim(),
      );
      const refreshed = await orderService.getOrder(order.orderNumber);
      setOrder(refreshed.data);
      setAdjustOpen(false);
      setAdjustAmount("");
      setAdjustReason("");
    } catch (err) {
      setAdjustError(
        err instanceof Error ? err.message : "Failed to adjust price.",
      );
    } finally {
      setAdjustSubmitting(false);
    }
  };

  return (
    <Dialog
      open={Boolean(orderNumber)}
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
        <Typography
          component="span"
          variant="h6"
          fontWeight={600}
          sx={{ color: getTextColor() }}
        >
          {orderNumber ? `Order ${orderNumber}` : "Order Details"}
        </Typography>
        {order && (
          <Chip
            label={STATUS_LABELS[order.status] || order.status}
            size="small"
            color={STATUS_COLORS[order.status] || "default"}
            sx={{ fontWeight: 500 }}
          />
        )}
      </DialogTitle>
      {order ? (
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ px: 3, borderBottom: `1px solid ${getBorderColor()}` }}
        >
          <Tab label="Invoice" />
          <Tab label="Receipts" />
          <Tab label="Delivery" />
        </Tabs>
      ) : null}
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={28} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : order ? (
          tab === 0 ? (
            <Stack spacing={2.5} sx={{ pt: 2 }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: getSecondaryTextColor() }}
                  >
                    Customer
                  </Typography>
                  <Typography sx={{ color: getTextColor(), fontWeight: 500 }}>
                    {order.customerName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: getSecondaryTextColor() }}
                  >
                    Phone
                  </Typography>
                  <Typography sx={{ color: getTextColor() }}>
                    {order.customerPhone || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: getSecondaryTextColor() }}
                  >
                    WhatsApp
                  </Typography>
                  <Typography sx={{ color: getTextColor() }}>
                    {order.whatsappNumber || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: getSecondaryTextColor() }}
                  >
                    Email
                  </Typography>
                  <Typography sx={{ color: getTextColor() }}>
                    {order.customerEmail || "—"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: getSecondaryTextColor() }}
                  >
                    Placed
                  </Typography>
                  <Typography sx={{ color: getTextColor() }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: getSecondaryTextColor() }}
                  >
                    Last Updated
                  </Typography>
                  <Typography sx={{ color: getTextColor() }}>
                    {new Date(order.updatedAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ borderColor: getBorderColor() }} />

              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: getSecondaryTextColor(),
                    letterSpacing: "0.2em",
                  }}
                >
                  Items
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Qty
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Unit Price
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Line Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {formatBaseCurrencyInCurrency(
                            item.unitSellingPrice,
                            currency,
                            rates,
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatBaseCurrencyInCurrency(
                            item.lineTotal,
                            currency,
                            rates,
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Divider sx={{ borderColor: getBorderColor() }} />

              {order.discountAmount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    variant="body2"
                    sx={{ color: getSecondaryTextColor() }}
                  >
                    Discount
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: getSecondaryTextColor() }}
                  >
                    -
                    {formatBaseCurrencyInCurrency(
                      order.discountAmount,
                      currency,
                      rates,
                    )}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600} sx={{ color: getTextColor() }}>
                  Total
                </Typography>
                <Typography fontWeight={600} sx={{ color: getTextColor() }}>
                  {formatBaseCurrencyInCurrency(
                    order.totalAmount,
                    currency,
                    rates,
                  )}
                </Typography>
              </Stack>

              {!isTerminal && (
                <Box>
                  {adjustOpen ? (
                    <Stack
                      spacing={1.5}
                      sx={{
                        p: 1.5,
                        border: `1px solid ${getBorderColor()}`,
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: getTextColor() }}
                      >
                        Adjust price (negotiated discount)
                      </Typography>
                      <TextField
                        label="New total amount"
                        type="number"
                        size="small"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Reason"
                        size="small"
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        placeholder="e.g. Phone negotiation - 500 off"
                        fullWidth
                      />
                      {adjustError && (
                        <Alert severity="error" sx={{ py: 0 }}>
                          {adjustError}
                        </Alert>
                      )}
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={adjustSubmitting}
                          onClick={handleAdjustSubmit}
                          sx={{ textTransform: "none" }}
                        >
                          {adjustSubmitting ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="small"
                          disabled={adjustSubmitting}
                          onClick={() => {
                            setAdjustOpen(false);
                            setAdjustError(null);
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setAdjustOpen(true)}
                      sx={{ textTransform: "none" }}
                    >
                      Adjust Price
                    </Button>
                  )}
                </Box>
              )}

              {order.notes && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2",
                    borderRadius: 1,
                    border: `1px solid ${getBorderColor()}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: getSecondaryTextColor(),
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ color: getTextColor() }}>
                    {order.notes}
                  </Typography>
                </Box>
              )}
            </Stack>
          ) : tab === 1 ? (
            <OrderReceiptsTab
              orderNumber={order.orderNumber}
              totalAmount={order.totalAmount}
              currency={currency}
              rates={rates}
            />
          ) : (
            <OrderDeliveryTab orderNumber={order.orderNumber} />
          )
        ) : null}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
