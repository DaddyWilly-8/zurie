"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShopGrid } from "@/features/shop/shop-grid";
import { categoryService } from "@/services/categories/category.service";
import { productService } from "@/services/products/product.service";

export const ShopPageClient = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("category") ?? "all";
  const initialSearch = searchParams?.get("search") ?? "";

  const productsQuery = useQuery({
    queryKey: ["storefront-products", initialCategory],
    queryFn: () =>
      productService.getStorefrontProducts({
        category: initialCategory === "all" ? undefined : initialCategory,
      }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: categoryService.listCategories,
  });

  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;
  const isError = productsQuery.isError || categoriesQuery.isError;
  const products = productsQuery.data ?? [];
  const categories = (categoriesQuery.data ?? []).map((item) => ({
    label: item.name,
    value: item.slug,
  }));

  if (isLoading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "48vh" }}
      >
        <CircularProgress aria-label="Loading collection" />
        <Typography sx={{ mt: 2, color: "text.secondary" }}>
          Loading collection...
        </Typography>
      </Stack>
    );
  }

  // Without this, a failed fetch left products/categories as their empty
  // fallback arrays and fell straight through to ShopGrid, which then
  // rendered "0 pieces" indistinguishable from a genuinely empty catalog
  // — a down/slow API looked identical to "we don't sell anything".
  if (isError) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ minHeight: "48vh", textAlign: "center" }}
      >
        <Alert severity="error" sx={{ maxWidth: 420 }}>
          We couldn&apos;t load the collection. Please check your connection and
          try again.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => {
            productsQuery.refetch();
            categoriesQuery.refetch();
          }}
        >
          Retry
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={{ xs: 2.4, md: 3.2 }} sx={{ pt: { xs: 1.5, md: 3 } }}>
      <Box sx={{ pt: 0.8 }}>
        <ShopGrid
          products={products}
          categories={categories}
          initialCategory={initialCategory}
          initialSearch={initialSearch}
        />
      </Box>
    </Stack>
  );
};
