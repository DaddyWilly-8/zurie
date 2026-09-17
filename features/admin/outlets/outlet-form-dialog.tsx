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
import type { CostCenter } from "@/services/cost-centers/cost-center.service";
import type { OutletForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  editing: boolean;
  form: OutletForm;
  costCenters: CostCenter[];
  onClose: () => void;
  onChange: <K extends keyof OutletForm>(key: K, value: OutletForm[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const OutletFormDialog = ({
  open,
  saving,
  editing,
  form,
  costCenters,
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
          {editing ? "Edit Sales Outlet" : "New Sales Outlet"}
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
                label="Type"
                value={form.type}
                onChange={(event) =>
                  onChange("type", event.target.value as OutletForm["type"])
                }
              >
                <MenuItem value="physical">Physical</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </TextField>
            </Grid>
            <Grid size={12}>
              <AdminField
                label="Address"
                value={form.address}
                onChange={(value) => onChange("address", value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Cost Center"
                value={form.costCenterId}
                onChange={(event) =>
                  onChange(
                    "costCenterId",
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              >
                <MenuItem value="">None</MenuItem>
                {costCenters.map((cc) => (
                  <MenuItem key={cc.id} value={cc.id}>
                    {cc.name}
                  </MenuItem>
                ))}
              </TextField>
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
