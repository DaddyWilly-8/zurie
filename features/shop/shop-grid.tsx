"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types/product";

type SortKey = "featured" | "price-low" | "price-high" | "newest";

type ShopCategory = {
  label: string;
  value: string;
};

const getCategoryMeta = (category: string, categories: ShopCategory[]) => {
  const selectedCategory = categories.find((item) => item.value === category);
  return {
    title: selectedCategory?.label ?? "All Pieces",
    subtitle: selectedCategory
      ? `Sculpted silhouettes in ${selectedCategory.label.toLowerCase()}, finished by hand.`
      : "A curated selection to be given, carried, and treasured by hand.",
  };
};

const sortProducts = (products: Product[], sortBy: SortKey) => {
  const clone = [...products];
  switch (sortBy) {
    case "price-low":
      return clone.sort((a, b) => a.price - b.price);
    case "price-high":
      return clone.sort((a, b) => b.price - a.price);
    case "newest":
      return clone.sort(
        (a, b) =>
          Number(new Date(b.createdAt ?? 0)) -
          Number(new Date(a.createdAt ?? 0)),
      );
    default:
      return clone.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
};

const normalizeCategory = (value: string, categories: ShopCategory[]) => {
  if (value === "all") return "all";
  const candidate = value.trim().toLowerCase();
  const matched = categories.find((item) => item.value.trim().toLowerCase() === candidate);
  return matched?.value ?? "all";
};

type ShopGridProps = {
  products: Product[];
  categories: ShopCategory[];
  initialCategory?: string;
};

export const ShopGrid = ({
  products,
  categories,
  initialCategory = "all",
}: ShopGridProps) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(
    normalizeCategory(initialCategory, categories),
  );
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const categoryMeta = getCategoryMeta(category, categories);

  useEffect(() => {
    setCategory(normalizeCategory(initialCategory, categories));
  }, [initialCategory, categories]);

  const updateCategory = (nextCategory: string) => {
    const normalized = normalizeCategory(nextCategory, categories);
    setCategory(normalized);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (normalized === "all") {
        params.delete("category");
      } else {
        params.set("category", normalized);
      }

      const queryString = params.toString();
      const nextUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;
      window.history.replaceState({}, "", nextUrl);
    }
  };

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesQuery =
        product.name.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized);
      const categoryValue =
        typeof product.category === "object" && product.category
          ? String((product.category as { slug?: unknown }).slug ?? "")
          : String(product.categorySlug ?? product.category ?? product.categoryId ?? "");
      const matchesCategory =
        category === "all" ||
        categoryValue.trim().toLowerCase() === category.trim().toLowerCase() ||
        String(product.categorySlug ?? "").trim().toLowerCase() === category.trim().toLowerCase() ||
        String(product.categoryId ?? "").trim().toLowerCase() === category.trim().toLowerCase();
      return matchesQuery && matchesCategory;
    });

    return sortProducts(filtered, sortBy);
  }, [category, products, query, sortBy]);

  return (
    <Stack spacing={{ xs: 2.4, md: 3.2 }}>
      <Stack alignItems="center" spacing={1.05} sx={{ textAlign: "center", pt: { xs: 0.8, md: 1.2 } }}>
        <Typography
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            fontSize: "0.7rem",
            color: "primary.main",
          }}
        >
          The Collection
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: { xs: "2.35rem", md: "3.7rem" },
            lineHeight: 1,
          }}
        >
          {categoryMeta.title}
        </Typography>
        <Typography color="text.secondary" textAlign="center" sx={{ maxWidth: 620 }}>
          {categoryMeta.subtitle}
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: "divider" }} />

      <Grid container spacing={{ xs: 2.5, md: 4 }}>
      <Grid size={{ xs: 12, md: 2.2 }}>
        <Stack
          spacing={1.1}
          sx={{
            position: { md: "sticky" },
            top: 94,
            pr: { md: 1 },
          }}
        >
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.22em",
              fontSize: "0.66rem",
              color: "text.secondary",
            }}
          >
            Silhouette
          </Typography>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <Select
              fullWidth
              size="small"
              value={category}
              onChange={(event) => updateCategory(event.target.value)}
              sx={{
                borderRadius: 0,
                backgroundColor: "background.paper",
                fontSize: "0.88rem",
              }}
            >
              <MenuItem value="all">All Pieces</MenuItem>
              {categories.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Stack spacing={1.05} sx={{ display: { xs: "none", md: "flex" } }}>
            <Typography
              onClick={() => updateCategory("all")}
              sx={{
                fontSize: "0.86rem",
                color: category === "all" ? "text.primary" : "text.secondary",
                cursor: "pointer",
                transition: "color 160ms ease",
              }}
            >
              All Pieces
            </Typography>
            {categories.map((item) => (
              <Typography
                key={item.value}
                onClick={() => updateCategory(item.value)}
                sx={{
                  fontSize: "0.86rem",
                  color:
                    category === item.value ? "primary.main" : "text.secondary",
                  cursor: "pointer",
                  transition: "color 160ms ease",
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 9.8 }}>
        <Stack spacing={2.4}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "start", md: "center" }}
            spacing={1.3}
          >
            <Typography color="text.secondary" sx={{ fontSize: "0.84rem" }}>
              {visibleProducts.length} pieces
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <TextField
                placeholder="Search..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                size="small"
                sx={{
                  minWidth: 200,
                  width: { xs: "100%", sm: 220, md: 220 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    backgroundColor: "background.paper",
                  },
                }}
              />
              <TextField
                select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                size="small"
                sx={{
                  minWidth: 160,
                  width: { xs: "100%", sm: 180 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    backgroundColor: "background.paper",
                  },
                }}
              >
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          <Grid container spacing={2.2}>
            {visibleProducts.map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 6 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>

          {visibleProducts.length === 0 ? (
            <Box sx={{ py: 5 }}>
              <Typography color="text.secondary">
                No pieces matched your filters.
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Grid>
      </Grid>
    </Stack>
  );
};
