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
import { AdminField, AdminToggle } from "@/components/admin";
import type { AdminProduct } from "@/features/admin/products";
import type { Stakeholder } from "@/services/stakeholders/stakeholder.service";
import type { Currency } from "@/services/currencies/currency.service";
import type { MeasurementUnit } from "@/services/measurement-units/measurement-unit.service";
import { emptyPurchaseOrderLine } from "./types";
import type { PurchaseOrderForm, PurchaseOrderLineForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  form: PurchaseOrderForm;
  stakeholders: Stakeholder[];
  products: AdminProduct[];
  measurementUnits: MeasurementUnit[];
  currencies: Currency[];
  onClose: () => void;
  onChange: <K extends keyof PurchaseOrderForm>(
    key: K,
    value: PurchaseOrderForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const PurchaseOrderFormDialog = ({
  open,
  saving,
  form,
  stakeholders,
  products,
  measurementUnits,
  currencies,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  const updateLine = (index: number, patch: Partial<PurchaseOrderLineForm>) => {
    const items = form.items.map((line, i) =>
      i === index ? { ...line, ...patch } : line,
    );
    onChange("items", items);
  };

  const addLine = () =>
    onChange("items", [...form.items, { ...emptyPurchaseOrderLine }]);

  const removeLine = (index: number) =>
    onChange(
      "items",
      form.items.filter((_, i) => i !== index),
    );

  const total = form.items.reduce(
    (sum, line) =>
      sum + (Number(line.quantity) || 0) * (Number(line.rate) || 0),
    0,
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          New Purchase Order
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              select
              fullWidth
              label="Stakeholder (leave blank for a cash purchase)"
              value={form.stakeholderId}
              onChange={(event) =>
                onChange(
                  "stakeholderId",
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
            >
              <MenuItem value="">Cash Purchase (no stakeholder)</MenuItem>
              {stakeholders.map((stakeholder) => (
                <MenuItem key={stakeholder.id} value={stakeholder.id}>
                  {stakeholder.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Date Required"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.dateRequired}
              onChange={(event) => onChange("dateRequired", event.target.value)}
            />

            {currencies.length > 1 ? (
              <TextField
                select
                fullWidth
                label="Currency"
                value={form.currencyId}
                onChange={(event) =>
                  onChange(
                    "currencyId",
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency.id} value={currency.id}>
                    {currency.code}
                    {currency.isBase ? " (Base)" : ""}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}

            <Box>
              <AdminToggle
                label="Instant Receive — mark every line fully received right away"
                checked={form.instantReceive}
                onChange={(checked) => onChange("instantReceive", checked)}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", pl: 4.5, mt: -0.5 }}
              >
                {form.instantReceive
                  ? "Stock and the ledger update immediately, same as a quick walk-in purchase."
                  : "Leave unchecked for goods arriving later — receive them (in full or in batches) from this purchase order's Receive Goods action."}
              </Typography>
            </Box>

            <Divider />
            <Typography variant="subtitle2">Items</Typography>

            {form.items.map((line, index) => (
              <Grid container spacing={1.5} key={index} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
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
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Unit"
                    value={line.measurementUnitId}
                    onChange={(event) =>
                      updateLine(index, {
                        measurementUnitId:
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                      })
                    }
                  >
                    {measurementUnits.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 4, md: 1.5 }}>
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
                <Grid size={{ xs: 4, md: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Rate"
                    value={line.rate}
                    onChange={(event) =>
                      updateLine(index, { rate: event.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 3, md: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="VAT %"
                    placeholder="Auto"
                    value={line.vatPercentage}
                    onChange={(event) =>
                      updateLine(index, { vatPercentage: event.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 1, md: 0.5 }}>
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

            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography color="text.secondary">
                  Subtotal (excl. VAT): {total.toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={12}>
                <AdminField
                  label="Notes"
                  value={form.notes}
                  onChange={(value) => onChange("notes", value)}
                  multiline
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save Purchase Order"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
