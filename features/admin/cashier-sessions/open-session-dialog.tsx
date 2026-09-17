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

type Props = {
  open: boolean;
  saving: boolean;
  outletName: string;
  onClose: () => void;
  onSubmit: (openingBalance: number) => void;
};

export const OpenSessionDialog = ({
  open,
  saving,
  outletName,
  onClose,
  onSubmit,
}: Props) => {
  const [openingBalance, setOpeningBalance] = useState("0");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Open Cashier Session
        </Typography>
      </DialogTitle>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(Number(openingBalance) || 0);
        }}
      >
        <DialogContent dividers>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Outlet: {outletName}
          </Typography>
          <AdminField
            label="Opening Balance"
            type="number"
            value={openingBalance}
            onChange={setOpeningBalance}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Opening..." : "Open Session"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
