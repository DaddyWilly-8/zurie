import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { AdminField } from "@/components/admin";
import type { CurrencyForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  editing: boolean;
  form: CurrencyForm;
  onClose: () => void;
  onChange: <K extends keyof CurrencyForm>(
    key: K,
    value: CurrencyForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const CurrencyFormDialog = ({
  open,
  saving,
  editing,
  form,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {editing ? "Edit Currency" : "New Currency"}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Name"
                value={form.name}
                onChange={(value) => onChange("name", value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Name (Plural)"
                value={form.namePlural}
                onChange={(value) => onChange("namePlural", value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <AdminField
                label="Code (e.g. USD)"
                value={form.code}
                onChange={(value) => onChange("code", value.toUpperCase())}
                required
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <AdminField
                label="Symbol"
                value={form.symbol}
                onChange={(value) => onChange("symbol", value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <AdminField
                label="Native Symbol"
                value={form.symbolNative}
                onChange={(value) => onChange("symbolNative", value)}
                required
              />
            </Grid>
            <Grid size={12}>
              <AdminField
                label="Decimal Digits"
                type="number"
                value={form.decimalDigits}
                onChange={(value) => onChange("decimalDigits", value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
