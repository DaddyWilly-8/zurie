import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import type { AdminProduct } from "@/features/admin/products";

type Props = {
  products: AdminProduct[];
  onAdd: (product: AdminProduct) => void;
};

const stockOf = (product: AdminProduct) =>
  product.stockCount ?? product.stock_count ?? product.quantity ?? 0;

export const PosProductGrid = ({ products, onAdd }: Props) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const published = products.filter(
      (p) => (p.status ?? "published") === "published",
    );
    if (!query) return published;
    return published.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku ?? "").toLowerCase().includes(query),
    );
  }, [products, search]);

  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Search products by name or SKU..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 2 }}
      />
      <Grid container spacing={1.5}>
        {filtered.map((product) => {
          const stock = stockOf(product);
          const outOfStock = stock <= 0;
          const salePrice = product.salePrice ?? product.sale_price ?? null;
          return (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={product.id}>
              <Card variant="outlined" sx={{ borderRadius: 0 }}>
                <CardActionArea
                  disabled={outOfStock}
                  onClick={() => onAdd(product)}
                  sx={{ p: 1.5 }}
                >
                  <Typography noWrap fontWeight={600} fontSize="0.9rem">
                    {product.name}
                  </Typography>
                  <Typography color="text.secondary" fontSize="0.85rem">
                    {(salePrice ?? product.price).toLocaleString()}
                    {salePrice != null ? (
                      <Box
                        component="s"
                        sx={{ ml: 0.75, color: "text.disabled" }}
                      >
                        {product.price.toLocaleString()}
                      </Box>
                    ) : null}
                  </Typography>
                  <Chip
                    size="small"
                    sx={{ mt: 0.5 }}
                    label={outOfStock ? "Out of stock" : `${stock} in stock`}
                    color={outOfStock ? "default" : "success"}
                  />
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
        {filtered.length === 0 ? (
          <Grid size={12}>
            <Typography
              color="text.secondary"
              sx={{ py: 4, textAlign: "center" }}
            >
              No products found.
            </Typography>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
};
