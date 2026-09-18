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
import type { MeasurementUnitForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  editing: boolean;
  form: MeasurementUnitForm;
  onClose: () => void;
  onChange: <K extends keyof MeasurementUnitForm>(
    key: K,
    value: MeasurementUnitForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const MeasurementUnitFormDialog = ({
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
          {editing ? "Edit Measurement Unit" : "New Measurement Unit"}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <AdminField
                label="Name"
                value={form.name}
                onChange={(value) => onChange("name", value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <AdminField
                label="Symbol"
                value={form.symbol}
                onChange={(value) => onChange("symbol", value)}
                required
              />
            </Grid>
            <Grid size={12}>
              <AdminField
                label="Description"
                value={form.description}
                onChange={(value) => onChange("description", value)}
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
