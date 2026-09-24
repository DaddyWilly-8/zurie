import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { AdminField } from "@/components/admin";
import type { CouponForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  form: CouponForm;
  currency: string;
  onClose: () => void;
  onChange: <K extends keyof CouponForm>(key: K, value: CouponForm[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const CouponFormDialog = ({
  open,
  saving,
  form,
  currency,
  onClose,
  onChange,
  onSubmit,
}: Props) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>
      <Typography
        variant="h5"
        sx={{ fontFamily: "var(--font-playfair), serif" }}
      >
        New Coupon
      </Typography>
    </DialogTitle>
    <Box component="form" onSubmit={onSubmit}>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AdminField
              label="Code"
              value={form.code}
              onChange={(value) => onChange("code", value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Discount type"
              value={form.type}
              onChange={(event) =>
                onChange("type", event.target.value as CouponForm["type"])
              }
              sx={{ mt: 3.2 }}
            >
              <MenuItem value="percentage">Percentage off</MenuItem>
              <MenuItem value="fixed">Fixed amount off</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AdminField
              label={
                form.type === "percentage"
                  ? "Discount (%)"
                  : `Discount (${currency})`
              }
              type="number"
              value={form.value}
              onChange={(value) => onChange("value", value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AdminField
              label={`Minimum order (${currency}, optional)`}
              type="number"
              value={form.minOrderAmount}
              onChange={(value) => onChange("minOrderAmount", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <AdminField
              label="Max uses (optional)"
              type="number"
              value={form.maxUses}
              onChange={(value) => onChange("maxUses", value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Valid from"
              value={form.validFrom}
              onChange={(event) => onChange("validFrom", event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ mt: 3.2 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Valid to"
              value={form.validTo}
              onChange={(event) => onChange("validTo", event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ mt: 3.2 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Create"}
        </Button>
      </DialogActions>
    </Box>
  </Dialog>
);
