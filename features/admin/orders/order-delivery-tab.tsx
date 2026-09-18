"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { orderService } from "@/services/orders/order.service";
import { ApiError } from "@/services/api/client";

type Props = {
  orderNumber: string;
};

/**
 * The Delivery tab — dispatch history (possibly multiple partial trips)
 * plus a form to record a new one. Purely a tracking record: Order
 * already decrements stock at sale time, so recording a delivery here has
 * no inventory or ledger effect (see DeliveryService's backend docblock)
 * — it only tracks "how much of what's been physically handed over."
 */
export const OrderDeliveryTab = ({ orderNumber }: Props) => {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveriesQuery = useQuery({
    queryKey: ["admin-order-deliveries", orderNumber],
    queryFn: () => orderService.getDeliveries(orderNumber),
  });

  const undispatchedQuery = useQuery({
    queryKey: ["admin-order-undispatched", orderNumber],
    queryFn: () => orderService.getUndispatchedItems(orderNumber),
  });

  const deliveries = deliveriesQuery.data ?? [];
  const undispatched = (undispatchedQuery.data ?? []).filter(
    (item) => item.remainingQuantity > 0,
  );

  const handleDispatch = async () => {
    const lines = undispatched
      .map((item) => ({
        orderItemId: item.orderItemId,
        quantityDispatched: Number(quantities[item.orderItemId]) || 0,
      }))
      .filter((line) => line.quantityDispatched > 0);

    if (lines.length === 0) return;

    setSaving(true);
    setError(null);
    try {
      await orderService.createDelivery(orderNumber, { lines });
      setQuantities({});
      await queryClient.invalidateQueries({
        queryKey: ["admin-order-deliveries", orderNumber],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-order-undispatched", orderNumber],
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to record delivery",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2.5} sx={{ pt: 2 }}>
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Box>
        <Typography variant="overline" color="text.secondary">
          Dispatch History
        </Typography>
        {deliveriesQuery.isLoading ? (
          <Typography color="text.secondary">Loading deliveries...</Typography>
        ) : deliveries.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            Nothing dispatched yet.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Delivery #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.deliveryNumber}</TableCell>
                    <TableCell>
                      {new Date(delivery.dateDispatched).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {delivery.lines
                        .map(
                          (line) =>
                            `${line.productName} × ${line.quantityDispatched}`,
                        )
                        .join(", ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {undispatched.length > 0 ? (
        <Box>
          <Typography variant="overline" color="text.secondary">
            Record a Delivery
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {undispatched.map((item) => (
              <TextField
                key={item.orderItemId}
                fullWidth
                size="small"
                type="number"
                label={`${item.productName} — ${item.remainingQuantity} remaining of ${item.quantity}`}
                placeholder="0"
                slotProps={{
                  htmlInput: { max: item.remainingQuantity, min: 0 },
                }}
                value={quantities[item.orderItemId] ?? ""}
                onChange={(event) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [item.orderItemId]: event.target.value,
                  }))
                }
              />
            ))}
            <Button
              variant="contained"
              onClick={handleDispatch}
              disabled={saving}
              sx={{ alignSelf: "flex-start" }}
            >
              {saving ? "Saving..." : "Record Delivery"}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Typography color="text.secondary" variant="body2">
          Every item on this order has already been fully dispatched.
        </Typography>
      )}
    </Stack>
  );
};
