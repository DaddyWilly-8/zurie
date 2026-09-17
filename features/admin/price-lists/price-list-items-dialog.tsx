import { useState } from "react";
import {
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import type { AdminProduct } from "@/features/admin/products";
import type { PriceList } from "./types";

type Props = {
  open: boolean;
  priceList: PriceList | null;
  products: AdminProduct[];
  onClose: () => void;
  onAddItem: (
    productId: number,
    price: number,
    salePrice?: number,
  ) => Promise<void>;
  onRemoveItem: (productId: number) => Promise<void>;
};

export const PriceListItemsDialog = ({
  open,
  priceList,
  products,
  onClose,
  onAddItem,
  onRemoveItem,
}: Props) => {
  const [productId, setProductId] = useState<number | "">("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saving, setSaving] = useState(false);

  const productName = (id: number) =>
    products.find((p) => String(p.id) === String(id))?.name ?? `#${id}`;

  const reset = () => {
    setProductId("");
    setPrice("");
    setSalePrice("");
  };

  const handleAdd = async () => {
    if (productId === "" || !price) return;
    setSaving(true);
    try {
      await onAddItem(
        Number(productId),
        Number(price),
        salePrice ? Number(salePrice) : undefined,
      );
      reset();
    } finally {
      setSaving(false);
    }
  };

  if (!priceList) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography
          variant="h5"
          sx={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {priceList.name} — Product Prices
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Sale Price</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priceList.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No product overrides yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                priceList.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>{productName(item.productId)}</TableCell>
                    <TableCell>{item.price.toLocaleString()}</TableCell>
                    <TableCell>
                      {item.salePrice?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onRemoveItem(item.productId)}
                      >
                        <FontAwesomeIcon icon={faTrash} size="xs" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Divider />

          <Typography variant="subtitle2">Add / Update Price</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                select
                fullWidth
                label="Product"
                value={productId}
                onChange={(event) =>
                  setProductId(
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={Number(product.id)}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Sale Price"
                type="number"
                value={salePrice}
                onChange={(event) => setSalePrice(event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 1 }}>
              <Button
                fullWidth
                variant="contained"
                disabled={saving || productId === "" || !price}
                onClick={handleAdd}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
