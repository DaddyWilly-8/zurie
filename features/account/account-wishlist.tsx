"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { productService } from "@/services/products/product.service";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";

/** Products the customer saved (kept on their account — see useWishlist). */
export const AccountWishlist = () => {
  const { wishlist, toggle } = useWishlist();
  const { currency, rates } = useCurrencyStore();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["storefront-products-all"],
    queryFn: () => productService.getStorefrontProducts({ pageSize: 100 }),
    enabled: wishlist.length > 0,
  });
  const saved = products.filter((product) => wishlist.includes(product.id));

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Wishlist
      </Typography>
      {wishlist.length === 0 ? (
        <Alert severity="info">
          Nothing saved yet — tap the heart on any piece to keep it here.
        </Alert>
      ) : isLoading ? (
        <CircularProgress size={24} />
      ) : saved.length === 0 ? (
        <Alert severity="info">
          The pieces you saved are no longer available.
        </Alert>
      ) : (
        <Stack divider={<Divider />} spacing={1.5}>
          {saved.map((product) => (
            <Stack
              key={product.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={1}
            >
              <Box>
                <Typography
                  component={Link}
                  href={`/shop/${product.slug}`}
                  fontWeight={600}
                  sx={{ color: "text.primary" }}
                >
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatBaseCurrencyInCurrency(product.price, currency, rates)}
                  {product.inStock ? "" : " · out of stock"}
                </Typography>
              </Box>
              <Button
                size="small"
                color="inherit"
                onClick={() => toggle(product.id)}
              >
                Remove
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
    </Paper>
  );
};
