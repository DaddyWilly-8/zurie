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
import type { Stakeholder } from "@/services/stakeholders/stakeholder.service";
import type { Currency } from "@/services/currencies/currency.service";
import type { SalesOutlet } from "@/services/outlets/outlet.service";
import { emptyProformaInvoiceLine } from "./types";
import type { ProformaInvoiceForm, ProformaInvoiceLineForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  title: string;
  form: ProformaInvoiceForm;
  outlets: SalesOutlet[];
  stakeholders: Stakeholder[];
  products: AdminProduct[];
  currencies: Currency[];
  onClose: () => void;
  onChange: <K extends keyof ProformaInvoiceForm>(
    key: K,
    value: ProformaInvoiceForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const ProformaInvoiceFormDialog = ({
  open,
  saving,
  title,
  form,
  outlets,
  stakeholders,
  products,
  currencies,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  const updateLine = (
    index: number,
    patch: Partial<ProformaInvoiceLineForm>,
  ) => {
    const items = form.items.map((line, i) =>
      i === index ? { ...line, ...patch } : line,
    );
    onChange("items", items);
  };

  const addLine = () =>
    onChange("items", [...form.items, { ...emptyProformaInvoiceLine }]);

  const removeLine = (index: number) =>
    onChange(
      "items",
      form.items.filter((_, i) => i !== index),
    );

  const total = form.items.reduce(
    (sum, line) =>
      sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
    0,
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {title}
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Sales Outlet"
                  value={form.salesOutletId}
                  onChange={(event) =>
                    onChange(
                      "salesOutletId",
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                  required
                >
                  {outlets.map((outlet) => (
                    <MenuItem key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Stakeholder"
                  value={form.stakeholderId}
                  onChange={(event) =>
                    onChange(
                      "stakeholderId",
                      event.target.value === ""
                        ? ""
                        : Number(event.target.value),
                    )
                  }
                  required
                >
                  {stakeholders.map((stakeholder) => (
                    <MenuItem key={stakeholder.id} value={stakeholder.id}>
                      {stakeholder.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Proforma Date"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={form.proformaDate}
                  onChange={(event) =>
                    onChange("proformaDate", event.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={form.expiryDate}
                  onChange={(event) =>
                    onChange("expiryDate", event.target.value)
                  }
                />
              </Grid>
            </Grid>

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

            <Divider />
            <Typography variant="subtitle2">Items</Typography>

            {form.items.map((line, index) => (
              <Grid container spacing={1.5} key={index} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 4, md: 2 }}>
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
                <Grid size={{ xs: 5, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Unit Price"
                    value={line.unitPrice}
                    onChange={(event) =>
                      updateLine(index, { unitPrice: event.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 3, md: 1 }}>
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
                  Total: {total.toLocaleString()}
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
            {saving ? "Saving..." : "Save Proforma Invoice"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
