import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { PurchaseOrder } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
  onSubmit: (
    lines: Array<{ purchaseOrderItemId: number; quantityReceived: number }>,
  ) => void;
};

/**
 * Scoped to one PurchaseOrder — lets an admin key in how much of each
 * item's still-unreceived quantity arrived on this delivery. The
 * remaining-to-receive figure shown per line comes straight from
 * `PurchaseOrderItemResource.remainingQuantity` (computed server-side
 * from every prior GRN) — the admin no longer has to do that
 * subtraction in their head. A line already fully received (remaining
 * <= 0) is hidden entirely rather than shown with nothing left to enter.
 * The server's own over-receive guard is still the actual enforcement;
 * this is just showing the same number, not duplicating the rule.
 */
export const ReceiveGrnDialog = ({
  open,
  saving,
  purchaseOrder,
  onClose,
  onSubmit,
}: Props) => {
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const items = useMemo(
    () =>
      (purchaseOrder?.items ?? []).filter((item) => item.remainingQuantity > 0),
    [purchaseOrder],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lines = items
      .map((item) => ({
        purchaseOrderItemId: item.id,
        quantityReceived: Number(quantities[item.id]) || 0,
      }))
      .filter((line) => line.quantityReceived > 0);
    if (lines.length === 0) return;
    onSubmit(lines);
    setQuantities({});
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Receive Goods — {purchaseOrder?.poNumber}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2}>
            {items.length === 0 ? (
              <Typography color="text.secondary">
                Every line on this purchase order has already been received in
                full.
              </Typography>
            ) : (
              items.map((item) => (
                <TextField
                  key={item.id}
                  fullWidth
                  size="small"
                  type="number"
                  label={`Product #${item.productId} — ${item.remainingQuantity} remaining of ${item.quantity} ordered`}
                  placeholder="0"
                  slotProps={{
                    htmlInput: { max: item.remainingQuantity, min: 0 },
                  }}
                  value={quantities[item.id] ?? ""}
                  onChange={(event) =>
                    setQuantities((prev) => ({
                      ...prev,
                      [item.id]: event.target.value,
                    }))
                  }
                />
              ))
            )}
            <Typography variant="caption" color="text.secondary">
              Leave a line at 0 to skip it on this delivery — over-receiving
              past what&apos;s still unreceived is rejected by the server.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Record Receipt"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
