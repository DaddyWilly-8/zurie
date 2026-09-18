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
import type { LedgerGroup, LedgerGroupForm, LedgerGroupNature } from "./types";

const NATURE_OPTIONS: LedgerGroupNature[] = [
  "asset",
  "liability",
  "income",
  "expense",
  "equity",
];

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
  editingId?: number;
  form: LedgerGroupForm;
  groups: LedgerGroup[];
  onClose: () => void;
  onChange: <K extends keyof LedgerGroupForm>(
    key: K,
    value: LedgerGroupForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const LedgerGroupFormDialog = ({
  open,
  saving,
  editing,
  editingId,
  form,
  groups,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  const parentOptions = flattenGroups(groups).filter(
    (group) => group.id !== editingId,
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {editing ? "Edit Ledger Group" : "New Ledger Group"}
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
              <AdminField
                label="Code"
                value={form.code}
                onChange={(value) => onChange("code", value)}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Nature"
                value={form.nature}
                required
                onChange={(event) =>
                  onChange("nature", event.target.value as LedgerGroupNature)
                }
              >
                {NATURE_OPTIONS.map((nature) => (
                  <MenuItem key={nature} value={nature}>
                    {nature.charAt(0).toUpperCase() + nature.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Parent Group"
                value={form.parentId}
                onChange={(event) =>
                  onChange(
                    "parentId",
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              >
                <MenuItem value="">None (top-level)</MenuItem>
                {parentOptions.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {"—".repeat(group.depth)} {group.name}
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
