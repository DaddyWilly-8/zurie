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
import type { Supplier } from "@/services/suppliers/supplier.service";
import { emptyPurchaseLine } from "./types";
import type { PurchaseForm, PurchaseLineForm } from "./types";

type Props = {
  open: boolean;
  saving: boolean;
  form: PurchaseForm;
  suppliers: Supplier[];
  products: AdminProduct[];
  onClose: () => void;
  onChange: <K extends keyof PurchaseForm>(
    key: K,
    value: PurchaseForm[K],
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const PurchaseFormDialog = ({
  open,
  saving,
  form,
  suppliers,
  products,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  const updateLine = (index: number, patch: Partial<PurchaseLineForm>) => {
    const items = form.items.map((line, i) =>
      i === index ? { ...line, ...patch } : line,
    );
    onChange("items", items);
  };

  const addLine = () =>
    onChange("items", [...form.items, { ...emptyPurchaseLine }]);

  const removeLine = (index: number) =>
    onChange(
      "items",
      form.items.filter((_, i) => i !== index),
    );

  const total = form.items.reduce(
    (sum, line) =>
      sum + (Number(line.quantity) || 0) * (Number(line.costPrice) || 0),
    0,
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          New Purchase
        </Typography>
      </DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              select
              fullWidth
              label="Supplier"
              value={form.supplierId}
              onChange={(event) =>
                onChange(
                  "supplierId",
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              required
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </TextField>

            <Divider />
            <Typography variant="subtitle2">Items</Typography>

            {form.items.map((line, index) => (
              <Grid container spacing={1.5} key={index} alignItems="center">
                <Grid size={{ xs: 12, md: 5 }}>
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
                    label="Cost Price"
                    value={line.costPrice}
                    onChange={(event) =>
                      updateLine(index, { costPrice: event.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 3, md: 2 }}>
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
              <Grid size={{ xs: 12, md: 6 }}>
                <AdminField
                  label="Amount Paid Now"
                  type="number"
                  value={form.amountPaid}
                  onChange={(value) => onChange("amountPaid", value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={{ pt: 2 }} color="text.secondary">
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
            {saving ? "Saving..." : "Create Purchase"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
