import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { AdminField } from "@/components/admin";
import type { Ledger, LedgerForm, LedgerGroup } from "./types";

type FlatGroup = { id: number; name: string; depth: number };

const flattenGroups = (groups: LedgerGroup[], depth = 0): FlatGroup[] => {
  const result: FlatGroup[] = [];
  for (const group of groups) {
    result.push({ id: group.id, name: group.name, depth });
    result.push(...flattenGroups(group.children ?? [], depth + 1));
  }
  return result;
};

type Props = {
  open: boolean;
  saving: boolean;
  editing: boolean;
  editingLedger?: Ledger | null;
  form: LedgerForm;
  groups: LedgerGroup[];
  onClose: () => void;
  onChange: <K extends keyof LedgerForm>(key: K, value: LedgerForm[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const LedgerFormDialog = ({
  open,
  saving,
  editing,
  editingLedger,
  form,
  groups,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  const groupOptions = flattenGroups(groups);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {editing ? "Edit Ledger" : "New Ledger"}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Ledger Group"
                value={form.ledgerGroupId}
                required
                onChange={(event) =>
                  onChange("ledgerGroupId", Number(event.target.value))
                }
              >
                {groupOptions.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {"—".repeat(group.depth)} {group.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <AdminField
                label="Name"
                value={form.name}
                onChange={(value) => onChange("name", value)}
                required
              />
            </Grid>
            <Grid size={12}>
              <AdminField
                label="Code"
                value={form.code}
                onChange={(value) => onChange("code", value)}
                required
              />
            </Grid>
            {editing ? (
              <Grid size={12}>
                <TextField
                  label="Current Balance"
                  value={(editingLedger?.currentBalance ?? 0).toLocaleString()}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>
            ) : (
              <>
                <Grid size={12}>
                  <AdminField
                    label="Opening Balance"
                    value={form.openingBalance}
                    onChange={(value) =>
                      onChange(
                        "openingBalance",
                        value === "" ? "" : Number(value),
                      )
                    }
                    type="number"
                  />
                </Grid>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.isContra}
                        onChange={(event) =>
                          onChange("isContra", event.target.checked)
                        }
                      />
                    }
                    label="Contra Ledger"
                  />
                </Grid>
              </>
            )}
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
