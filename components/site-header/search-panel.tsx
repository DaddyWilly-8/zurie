"use client";

import Image from "next/image";
import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import type { Product } from "@/types/product";

type CategorySuggestion = { name: string; slug: string };

// Default (no query typed yet) options — each opens the matching section on
// the Home page, not the Shop listing. Once the admin types something, the
// panel switches to live product/category matches that open in Shop instead.
const QUICK_FILTERS = [
  { label: "Featured Pieces", anchor: "featured-pieces" },
  { label: "Shop by Category", anchor: "shop-by-category" },
  { label: "Best Sellers", anchor: "best-sellers" },
  { label: "New Arrivals", anchor: "new-arrivals" },
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  matchedProducts: Product[];
  matchedCategories: CategorySuggestion[];
  onSelectProduct: (slug: string) => void;
  onSelectCategory: (slug: string) => void;
  onSelectQuickFilter: (anchor: string) => void;
  // Key of the item currently being navigated to (e.g. "product:aurelia"),
  // or null when nothing is in flight — drives the per-item spinner so the
  // admin can see that opening the page is still in progress.
  pendingKey: string | null;
};

export const SiteHeaderSearchPanel = ({
  value,
  onChange,
  onSubmit,
  matchedProducts,
  matchedCategories,
  onSelectProduct,
  onSelectCategory,
  onSelectQuickFilter,
  pendingKey,
}: Props) => {
  const hasQuery = value.trim().length > 0;
  const hasResults = matchedProducts.length > 0 || matchedCategories.length > 0;
  const isPending = pendingKey !== null;

  const spinner = (
    <CircularProgress size={12} thickness={6} sx={{ color: "inherit" }} />
  );

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        py: 1.1,
      }}
    >
      <TextField
        size="small"
        autoFocus
        fullWidth
        placeholder="Search products, categories, best sellers, new arrivals..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <Box component="span" sx={{ color: "text.secondary", mr: 1 }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} fontSize={12} />
              </Box>
            ),
          },
        }}
      />

      {!hasQuery ? (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          sx={{
            mt: 1.2,
            gap: 1,
            opacity: isPending ? 0.6 : 1,
            pointerEvents: isPending ? "none" : "auto",
          }}
        >
          {QUICK_FILTERS.map((filter) => {
            const key = `home:${filter.anchor}`;
            return (
              <Chip
                key={filter.label}
                label={filter.label}
                size="small"
                icon={pendingKey === key ? spinner : undefined}
                onClick={() => onSelectQuickFilter(filter.anchor)}
                sx={{ cursor: "pointer", color: "text.primary" }}
              />
            );
          })}
        </Stack>
      ) : (
        <Box sx={{ mt: 1.2, maxHeight: 360, overflowY: "auto" }}>
          {matchedCategories.length > 0 && (
            <Stack spacing={0.6} sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: "0.62rem",
                  color: "text.secondary",
                }}
              >
                Categories
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                sx={{
                  gap: 1,
                  opacity: isPending ? 0.6 : 1,
                  pointerEvents: isPending ? "none" : "auto",
                }}
              >
                {matchedCategories.map((cat) => {
                  const key = `category:${cat.slug}`;
                  return (
                    <Chip
                      key={cat.slug}
                      label={cat.name}
                      size="small"
                      icon={pendingKey === key ? spinner : undefined}
                      onClick={() => onSelectCategory(cat.slug)}
                      sx={{ cursor: "pointer", color: "text.primary" }}
                    />
                  );
                })}
              </Stack>
            </Stack>
          )}

          {matchedProducts.length > 0 && (
            <Stack spacing={0.6}>
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: "0.62rem",
                  color: "text.secondary",
                }}
              >
                Products
              </Typography>
              <Stack
                spacing={0.3}
                sx={{
                  opacity: isPending ? 0.6 : 1,
                  pointerEvents: isPending ? "none" : "auto",
                }}
              >
                {matchedProducts.map((product) => {
                  const key = `product:${product.slug}`;
                  const isThisPending = pendingKey === key;
                  return (
                    <Box
                      key={product.id}
                      onClick={() => onSelectProduct(product.slug)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        p: 0.8,
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: 36,
                          height: 36,
                          borderRadius: 0.5,
                          overflow: "hidden",
                          flexShrink: 0,
                          bgcolor: "action.hover",
                        }}
                      >
                        <Image
                          src={
                            product.images?.[0]?.url ??
                            "/images/products/fallback.png"
                          }
                          alt={product.images?.[0]?.alt ?? product.name}
                          fill
                          sizes="36px"
                          style={{ objectFit: "cover" }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          flex: 1,
                          color: "text.primary",
                        }}
                        noWrap
                      >
                        {product.name}
                      </Typography>
                      {isThisPending && (
                        <CircularProgress size={14} thickness={6} />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Stack>
          )}

          {!hasResults && (
            <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
              No matches for &ldquo;{value}&rdquo;.
            </Typography>
          )}

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.8}
            sx={{ mt: 1.2 }}
          >
            <Typography
              component="button"
              type="submit"
              disabled={isPending}
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "0.66rem",
                color: "text.secondary",
                background: "none",
                border: "none",
                cursor: "pointer",
                p: 0,
                display: "block",
                "&:hover": { color: "text.primary" },
                "&:disabled": { opacity: 0.6, cursor: "default" },
              }}
            >
              See all results for &ldquo;{value}&rdquo;
            </Typography>
            {pendingKey === "search" && (
              <CircularProgress size={12} thickness={6} />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};
