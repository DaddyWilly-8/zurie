import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { AdminField } from "@/components/admin";
import type { CashierSession } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  session: CashierSession | null;
  onClose: () => void;
  onSubmit: (closingBalance: number) => void;
};

export const CloseSessionDialog = ({
  open,
  saving,
  session,
  onClose,
  onSubmit,
}: Props) => {
  const [closingBalance, setClosingBalance] = useState("0");

  if (!session) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Close Cashier Session
        </Typography>
      </DialogTitle>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(Number(closingBalance) || 0);
        }}
      >
        <DialogContent dividers>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Opened with {session.openingBalance.toLocaleString()} on{" "}
            {new Date(session.openedAt).toLocaleString()}
          </Typography>
          <AdminField
            label="Closing Balance (actual cash counted)"
            type="number"
            value={closingBalance}
            onChange={setClosingBalance}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Closing..." : "Close Session"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
