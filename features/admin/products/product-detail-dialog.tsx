"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import { productService } from "@/services/products/product.service";
import { categoryService } from "@/services/categories/category.service";
import type { AdminProduct } from "./types";

const STATUS_LABELS: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

const STATUS_COLORS: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  published: "success",
  draft: "warning",
  archived: "error",
};

const STOCK_LABELS: Record<string, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

const STOCK_COLORS: Record<string, "success" | "warning" | "error"> = {
  IN_STOCK: "success",
  LOW_STOCK: "warning",
  OUT_OF_STOCK: "error",
};

type ProductDetailDialogProps = {
  productId: string | null;
  onClose: () => void;
  isDarkMode: boolean;
};

// Read-only detail view — GET /admin/products/{id}. Used by the dashboard's
// "Recent Products" panel so clicking an item shows that specific product
// without leaving the page or opening the full edit form.
export const ProductDetailDialog = ({
  productId,
  onClose,
  isDarkMode,
}: ProductDetailDialogProps) => {
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "#e9e2d8";
  const getDialogBackground = () => (isDarkMode ? "#1e1e1e" : "#ffffff");
  const getTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getSecondaryTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary";

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    productService
      .getAdminProductById(String(productId))
      .then((result) => {
        if (active) setProduct(result);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load product.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  // Admin product responses only carry categoryId, never a nested category
  // object (doc §3) — resolve the name client-side against the category list.
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => categoryService.listAdminCategories(),
  });
  const categoryName = useMemo(() => {
    const categoryId = product?.categoryId ?? product?.category_id;
    if (categoryId == null) return product?.category || null;
    return (
      categories.find((c) => String(c.id) === String(categoryId))?.name ??
      product?.category ??
      null
    );
  }, [categories, product]);

  const imageUrl = product?.imageUrls?.[0] ?? product?.images?.[0]?.url ?? null;
  const status = product?.status ?? "draft";
  const stockStatus = product?.stockStatus ?? product?.stock_status;
  const quantity =
    product?.quantity ?? product?.stockCount ?? product?.stock_count;

  return (
    <Dialog
      open={Boolean(productId)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
          bgcolor: getDialogBackground(),
          border: `1px solid ${getBorderColor()}`,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography
          component="span"
          variant="h6"
          fontWeight={600}
          sx={{ color: getTextColor() }}
        >
          {product?.name ?? "Product Details"}
        </Typography>
        {product && (
          <Chip
            label={STATUS_LABELS[status] || status}
            size="small"
            color={STATUS_COLORS[status] || "default"}
            sx={{ fontWeight: 500 }}
          />
        )}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={28} />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : product ? (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: 1,
                  overflow: "hidden",
                  flexShrink: 0,
                  bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography
                    variant="caption"
                    sx={{ color: getSecondaryTextColor() }}
                  >
                    No image
                  </Typography>
                )}
              </Box>
              <Stack spacing={0.5} flex={1} minWidth={0}>
                <Typography
                  variant="caption"
                  sx={{ color: getSecondaryTextColor() }}
                >
                  SKU: {product.sku || "—"}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography sx={{ color: getTextColor(), fontWeight: 700 }}>
                    {formatBaseCurrencyInCurrency(
                      product.salePrice ?? product.price,
                      currency,
                      rates,
                    )}
                  </Typography>
                  {product.salePrice != null && (
                    <Typography
                      sx={{
                        color: getSecondaryTextColor(),
                        textDecoration: "line-through",
                        fontSize: "0.85rem",
                      }}
                    >
                      {formatBaseCurrencyInCurrency(
                        product.price,
                        currency,
                        rates,
                      )}
                    </Typography>
                  )}
                </Stack>
                {stockStatus && (
                  <Chip
                    label={`${STOCK_LABELS[stockStatus] || stockStatus}${
                      quantity != null ? ` (${quantity})` : ""
                    }`}
                    size="small"
                    color={STOCK_COLORS[stockStatus] || "default"}
                    sx={{ alignSelf: "flex-start", fontWeight: 500 }}
                  />
                )}
              </Stack>
            </Stack>

            <Divider sx={{ borderColor: getBorderColor() }} />

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <Typography
                  variant="caption"
                  sx={{ color: getSecondaryTextColor() }}
                >
                  Category
                </Typography>
                <Typography sx={{ color: getTextColor() }}>
                  {categoryName || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography
                  variant="caption"
                  sx={{ color: getSecondaryTextColor() }}
                >
                  Material
                </Typography>
                <Typography sx={{ color: getTextColor() }}>
                  {product.material || "—"}
                </Typography>
              </Grid>
            </Grid>

            {product.description && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: getSecondaryTextColor() }}
                >
                  Description
                </Typography>
                <Typography variant="body2" sx={{ color: getTextColor() }}>
                  {product.description}
                </Typography>
              </Box>
            )}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
