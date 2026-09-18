import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AdminField } from "@/components/admin";
import type { AdminProduct } from "@/features/admin/products";
import type { SalesOutlet } from "@/services/outlets/outlet.service";
import type { CostCenter } from "@/services/cost-centers/cost-center.service";
import { emptyInventoryTransferLine } from "./types";
import type {
  InventoryTransferForm,
  InventoryTransferLineForm,
  InventoryTransferType,
} from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  form: InventoryTransferForm;
  outlets: SalesOutlet[];
  costCenters: CostCenter[];
  products: AdminProduct[];
  onClose: () => void;
  onChange: <K extends keyof InventoryTransferForm>(
    key: K,
    value: InventoryTransferForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const TYPE_HELP: Record<InventoryTransferType, string> = {
  internal: "Stock moves between two of our own outlets. No ledger effect.",
  external:
    "Stock leaves the business entirely (write-off) — posts a ledger entry valued at quantity × buying price. No destination outlet needed.",
  cost_center_change:
    "Pure audit-trail record only, zero stock/ledger movement — reassigns which cost center a batch is attributed to.",
};

export const InventoryTransferFormDialog = ({
  open,
  saving,
  form,
  outlets,
  costCenters,
  products,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  const updateLine = (
    index: number,
    patch: Partial<InventoryTransferLineForm>,
  ) => {
    const items = form.items.map((line, i) =>
      i === index ? { ...line, ...patch } : line,
    );
    onChange("items", items);
  };

  const addLine = () =>
    onChange("items", [...form.items, { ...emptyInventoryTransferLine }]);

  const removeLine = (index: number) =>
    onChange(
      "items",
      form.items.filter((_, i) => i !== index),
    );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          New Inventory Transfer
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              select
              fullWidth
              label="Type"
              value={form.type}
              onChange={(event) =>
                onChange("type", event.target.value as InventoryTransferType)
              }
            >
              <MenuItem value="internal">Internal (outlet to outlet)</MenuItem>
              <MenuItem value="external">External (write-off)</MenuItem>
              <MenuItem value="cost_center_change">Cost Center Change</MenuItem>
            </TextField>
            <Typography variant="caption" color="text.secondary">
              {TYPE_HELP[form.type]}
            </Typography>

            <TextField
              select
              fullWidth
              label="Source Outlet"
              value={form.sourceOutletId}
              onChange={(event) =>
                onChange(
                  "sourceOutletId",
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
            >
              {outlets.map((outlet) => (
                <MenuItem key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </MenuItem>
              ))}
            </TextField>

            {form.type === "internal" ? (
              <TextField
                select
                fullWidth
                label="Destination Outlet"
                value={form.destinationOutletId}
                onChange={(event) =>
                  onChange(
                    "destinationOutletId",
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              >
                {outlets.map((outlet) => (
                  <MenuItem key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}

            {form.type === "cost_center_change" ? (
              <>
                <TextField
                  select
                  fullWidth
                  label="Source Cost Center"
                  value={form.sourceCostCenterId}
                  onChange={(event) =>
                    onChange(
                      "sourceCostCenterId",
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                >
                  {costCenters.map((cc) => (
                    <MenuItem key={cc.id} value={cc.id}>
                      {cc.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Destination Cost Center"
                  value={form.destinationCostCenterId}
                  onChange={(event) =>
                    onChange(
                      "destinationCostCenterId",
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                >
                  {costCenters.map((cc) => (
                    <MenuItem key={cc.id} value={cc.id}>
                      {cc.name}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            ) : null}

            <TextField
              fullWidth
              label="Transfer Date"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.transferDate}
              onChange={(event) => onChange("transferDate", event.target.value)}
            />

            <Divider />
            <Typography variant="subtitle2">Items</Typography>

            {form.items.map((line, index) => (
              <Grid container spacing={1.5} key={index} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Product"
                    value={line.productId}
                    onChange={(event) =>
                      updateLine(index, {
                        productId:
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                      })
                    }
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={Number(product.id)}>
                        {product.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 9, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Qty"
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(index, { quantity: event.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 1, md: 1 }}>
                  <IconButton
                    onClick={() => removeLine(index)}
                    disabled={form.items.length === 1}
                    color="error"
                  >
                    <FontAwesomeIcon icon={faTrash} size="xs" />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              startIcon={<FontAwesomeIcon icon={faPlus} size="xs" />}
              onClick={addLine}
              sx={{ alignSelf: "flex-start" }}
            >
              Add Line
            </Button>

            <Divider />

            <AdminField
              label="Notes"
              value={form.notes}
              onChange={(value) => onChange("notes", value)}
              multiline
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save Transfer"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
