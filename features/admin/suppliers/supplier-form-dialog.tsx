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
import type { SupplierForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  editing: boolean;
  form: SupplierForm;
  onClose: () => void;
  onChange: <K extends keyof SupplierForm>(
    key: K,
    value: SupplierForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const SupplierFormDialog = ({
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
          {editing ? "Edit Supplier" : "New Supplier"}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <AdminField
                label="Name"
                value={form.name}
                onChange={(value) => onChange("name", value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Phone"
                value={form.phone}
                onChange={(value) => onChange("phone", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AdminField
                label="Email"
                value={form.email}
                onChange={(value) => onChange("email", value)}
              />
            </Grid>
            <Grid size={12}>
              <AdminField
                label="Address"
                value={form.address}
                onChange={(value) => onChange("address", value)}
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
