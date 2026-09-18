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
 * item's still-unreceived quantity arrived on this delivery. Doesn't try
 * to track "already received" client-side (that's derived server-side
 * from every prior GRN); it just submits whatever the admin enters and
 * lets GrnService's over-receive guard reject an invalid amount.
 */
export const ReceiveGrnDialog = ({
  open,
  saving,
  purchaseOrder,
  onClose,
  onSubmit,
}: Props) => {
  const [quantities, setQuantities] = useState<Record<number, string>>({});

  const items = useMemo(() => purchaseOrder?.items ?? [], [purchaseOrder]);

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
            {items.map((item) => (
              <TextField
                key={item.id}
                fullWidth
                size="small"
                type="number"
                label={`Product #${item.productId} — ordered ${item.quantity}`}
                placeholder="0"
                value={quantities[item.id] ?? ""}
                onChange={(event) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [item.id]: event.target.value,
                  }))
                }
              />
            ))}
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
