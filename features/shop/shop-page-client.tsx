"use client";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShopGrid } from "@/features/shop/shop-grid";
import { categoryService } from "@/services/categories/category.service";
import { getProducts } from "@/services/products";

export const ShopPageClient = () => {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("category") ?? "all";

  const productsQuery = useQuery({
    queryKey: ["storefront-products", initialCategory],
    queryFn: () => getProducts({ category: initialCategory === "all" ? undefined : initialCategory }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: categoryService.listCategories,
  });

  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;
  const products = productsQuery.data ?? [];
  const categories = (categoriesQuery.data ?? []).map((item) => ({ label: item.name, value: item.slug }));

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "48vh" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2, color: "text.secondary" }}>Loading collection...</Typography>
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
        />
      </Box>
    </Stack>
  );
};