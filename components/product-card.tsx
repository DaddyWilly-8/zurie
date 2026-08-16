"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBagShopping,
  faHeart as faHeartRegular,
} from "@fortawesome/free-solid-svg-icons";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import type { Product } from "@/types/product";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import { useShopStore } from "@/hooks/use-shop-store";

const MotionCard = motion(Card);

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useShopStore((state) => state.addToCart);
  const wishlist = useShopStore((state) => state.wishlist);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);
  const inWishlist = wishlist.includes(product.id);
  const categoryLabel =
    (typeof product.category === "object" &&
    product.category &&
    "name" in product.category
      ? String(product.category.name ?? "")
      : product.categoryLabel) || "Uncategorized";

  return (
    <MotionCard
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      sx={{
        borderRadius: 0,
        overflow: "hidden",
        border: (theme) =>
          `1px solid ${theme.palette.mode === "dark" ? "#383129" : "#e8dfd1"}`,
        boxShadow: "none",
        backgroundColor: "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ position: "relative", height: 345, overflow: "hidden" }}>
        <Link href={`/shop/${product.slug}`}>
          <Image
            src={product.images?.[0]?.url ?? "/images/products/fallback.png"}
            alt={product.images?.[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            style={{ objectFit: "cover", transition: "transform 260ms ease" }}
          />
        </Link>
        <Stack
          direction="row"
          spacing={1}
          sx={{ position: "absolute", top: 10, left: 10 }}
        >
          {product.newArrival ? (
            <Chip size="small" label="New" color="primary" />
          ) : null}
          {product.bestSeller ? (
            <Chip size="small" label="Best Seller" />
          ) : null}
        </Stack>

        {/* <IconButton
          aria-label="Add to wishlist"
          onClick={() => toggleWishlist(product.id)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(34, 31, 27, 0.92)"
                : "rgba(255,255,255,0.92)",
            "&:hover": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(45, 41, 36, 0.95)" : "#fff",
            },
          }}
        >
          <FontAwesomeIcon
            icon={faHeartRegular}
            color={inWishlist ? "#b58a57" : "currentColor"}
            fontSize={13}
          />
        </IconButton> */}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 10,
            opacity: 0,
            transform: "translateY(6px)",
            transition: "all 220ms ease",
            ".MuiCard-root:hover &": {
              opacity: 1,
              transform: "translateY(0)",
            },
          }}
        >
          <Button
            variant="contained"
            fullWidth
            size="small"
            startIcon={<FontAwesomeIcon icon={faBagShopping} fontSize={12} />}
            disabled={!product.inStock}
            onClick={() => addToCart(product, 1)}
          >
            Add to Bag
          </Button>
          <Button
            component={Link}
            href={`/shop/${product.slug}`}
            variant="outlined"
            size="small"
            fullWidth
          >
            Quick View
          </Button>
        </Stack>
      </Box>

      <Stack spacing={0.75} sx={{ p: 2.1, pt: 1.8 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          {categoryLabel}
        </Typography>
        <Typography
          component={Link}
          href={`/shop/${product.slug}`}
          variant="h6"
          sx={{
            textDecoration: "none",
            color: "text.primary",
            fontSize: "1.05rem",
            fontFamily: "var(--font-playfair), serif",
          }}
        >
          {product.name}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {formatBaseCurrencyInCurrency(product.price, currency, rates)}
        </Typography>
        <Typography
          component={Link}
          href={`/shop/${product.slug}`}
          variant="caption"
          color="text.secondary"
          sx={{
            textDecoration: "none",
            mt: 0.35,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.6,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Explore
          <FontAwesomeIcon icon={faArrowRight} fontSize={10} />
        </Typography>
      </Stack>
    </MotionCard>
  );
};
