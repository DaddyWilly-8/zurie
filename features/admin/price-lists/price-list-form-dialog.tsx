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
import type { SalesOutlet } from "@/services/outlets/outlet.service";
import type { PriceListForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  editing: boolean;
  form: PriceListForm;
  outlets: SalesOutlet[];
  onClose: () => void;
  onChange: <K extends keyof PriceListForm>(
    key: K,
    value: PriceListForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const PriceListFormDialog = ({
  open,
  saving,
  editing,
  form,
  outlets,
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
          {editing ? "Edit Price List" : "New Price List"}
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
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Outlet (leave blank for customer-scoped)"
                value={form.outletId}
                onChange={(event) =>
                  onChange(
                    "outletId",
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              >
                <MenuItem value="">None</MenuItem>
                {outlets.map((outlet) => (
                  <MenuItem key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Valid From"
                value={form.validFrom}
                onChange={(event) => onChange("validFrom", event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Valid To"
                value={form.validTo}
                onChange={(event) => onChange("validTo", event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary">
                Customer-specific price lists are assigned from the customer
                record, not here — leave Outlet blank only if this list is meant
                to be attached to a specific customer elsewhere.
              </Typography>
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
