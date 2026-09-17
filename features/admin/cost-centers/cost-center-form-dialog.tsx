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
import type { CostCenter, CostCenterForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  editing: boolean;
  form: CostCenterForm;
  costCenters: CostCenter[];
  editingId?: number;
  onClose: () => void;
  onChange: <K extends keyof CostCenterForm>(
    key: K,
    value: CostCenterForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const CostCenterFormDialog = ({
  open,
  saving,
  editing,
  form,
  costCenters,
  editingId,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  // Excludes the row being edited (and, for simplicity, doesn't attempt
  // deeper cycle detection beyond that — the backend's own self-parent
  // guard in CostCenterService::update() is still the real safety net).
  const parentOptions = costCenters.filter((cc) => cc.id !== editingId);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {editing ? "Edit Cost Center" : "New Cost Center"}
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
                label="Parent Cost Center"
                value={form.parentId}
                onChange={(event) =>
                  onChange(
                    "parentId",
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              >
                <MenuItem value="">None (top-level)</MenuItem>
                {parentOptions.map((cc) => (
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
