"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useShopStore } from "@/hooks/use-shop-store";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import type { Product } from "@/types/product";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import {
  buildWhatsAppCheckoutLink,
  buildWhatsAppOrderMessage,
} from "@/utils/whatsapp";
import { SITE } from "@/constants/site";

export const ProductDetailClient = ({ product, categoryLabel }: { product: Product; categoryLabel: string }) => {
  const productImages = product.images ?? [];
  const [activeImage, setActiveImage] = useState(productImages[0]?.url ?? "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useShopStore((state) => state.addToCart);
  const toggleWishlist = useShopStore((state) => state.toggleWishlist);
  const addRecentlyViewed = useShopStore((state) => state.addRecentlyViewed);
  const wishlist = useShopStore((state) => state.wishlist);
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  const inWishlist = wishlist.includes(product.id);
  const specificationRows = (product.specifications ?? [])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  const whatsappLink = useMemo(() => {
    const message = buildWhatsAppOrderMessage({
      customerName: "Website Customer",
      items: [
        {
          productId: product.id,
          quantity,
          product: {
            ...product,
            name: `${product.name}${selectedColor ? ` - ${selectedColor.name}` : ""}`,
          },
        },
      ],
      total: product.price * quantity,
      currency,
      rates,
    });
    return buildWhatsAppCheckoutLink(SITE.whatsappNumber, message);
  }, [currency, product, quantity, rates, selectedColor]);

  return (
    <Stack spacing={{ xs: 4, md: 5.5 }}>
      <Typography
        component="div"
        sx={{
          color: "text.secondary",
          fontSize: "0.76rem",
          display: "flex",
          gap: 0.8,
          flexWrap: "wrap",
        }}
      >
        <Typography component={Link} href="/" sx={{ color: "inherit", textDecoration: "none", fontSize: "inherit" }}>
          Home
        </Typography>
        /
        <Typography component={Link} href="/shop" sx={{ color: "inherit", textDecoration: "none", fontSize: "inherit" }}>
          Shop
        </Typography>
        /
        <Typography sx={{ color: "text.primary", fontSize: "inherit" }}>
          {product.name}
        </Typography>
      </Typography>

      <Grid container spacing={{ xs: 3.2, md: 5.2 }}>
        <Grid size={{ xs: 12, md: 6.2 }}>
        <Box
          sx={{
            position: "relative",
            height: { xs: 380, sm: 520, md: 760 },
            overflow: "hidden",
            bgcolor: "background.paper",
            mb: 1.6,
          }}
        >
          <Image
            src={activeImage || "/images/products/fallback.png"}
            alt={product.name}
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            style={{ objectFit: "cover" }}
          />
        </Box>
        <Stack direction="row" spacing={1.25} sx={{ overflowX: "auto", pb: 0.4 }}>
          {productImages.map((image) => (
            <Button
              key={image.url}
              onClick={() => setActiveImage(image.url)}
              sx={{
                p: 0,
                minWidth: 0,
                border:
                  activeImage === image.url ? "1px solid" : "1px solid",
                borderColor:
                  activeImage === image.url ? "text.primary" : "divider",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: 74,
                  height: 92,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </Box>
            </Button>
          ))}
        </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5.8 }}>
        <Stack spacing={2.15}>
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              fontSize: "0.66rem",
              color: "#b89a73",
            }}
          >
            {categoryLabel}
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "2.3rem", md: "3.4rem" },
              lineHeight: 0.98,
            }}
          >
            {product.name}
          </Typography>
          <Typography sx={{ fontSize: { xs: "1.55rem", md: "1.9rem" } }}>
            {formatBaseCurrencyInCurrency(product.price, currency, rates)}
          </Typography>

          <Typography
            sx={{
              color: product.inStock ? "#9c835d" : "error.main",
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.6,
            }}
          >
            {product.inStock ? <CheckIcon sx={{ fontSize: 14 }} /> : null}
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Typography>

          <Typography color="text.secondary" sx={{ maxWidth: 560, lineHeight: 1.7 }}>
            {product.description}
          </Typography>

          <Stack spacing={1.1} sx={{ pt: 1.1 }}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.32em",
                fontSize: "0.65rem",
                color: "text.secondary",
              }}
            >
              Colour: {selectedColor?.name ?? "Classic"}
            </Typography>

            <Stack direction="row" spacing={0.9} flexWrap="wrap" useFlexGap>
              {product.colors.map((color) => {
                const isActive = selectedColor?.name === color.name;
                return (
                  <Button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    sx={{
                      minWidth: 44,
                      px: 1.35,
                      py: 0.75,
                      borderRadius: 0,
                      border: "1px solid",
                      borderColor: isActive ? "primary.main" : "divider",
                      bgcolor: isActive ? "action.selected" : "background.paper",
                      color: "text.primary",
                      fontSize: "0.75rem",
                      fontWeight: 400,
                    }}
                  >
                    {color.name}
                  </Button>
                );
              })}
            </Stack>
          </Stack>

          <Stack spacing={1.05} sx={{ pt: 0.8 }}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.32em",
                fontSize: "0.65rem",
                color: "text.secondary",
              }}
            >
              Quantity
            </Typography>

            <Stack direction="row" spacing={0} alignItems="center">
              <IconButton
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                sx={{ width: 34, height: 34, border: "1px solid", borderColor: "divider", borderRadius: 0 }}
              >
                <RemoveIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Box
                sx={{
                  width: 44,
                  height: 34,
                  borderTop: "1px solid",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.9rem",
                }}
              >
                {quantity}
              </Box>
              <IconButton
                onClick={() => setQuantity((current) => current + 1)}
                sx={{ width: 34, height: 34, border: "1px solid", borderColor: "divider", borderRadius: 0 }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ pt: 0.5 }}>
            <Button
              variant="contained"
              disabled={!product.inStock}
              onClick={() => {
                addToCart(product, quantity);
                addRecentlyViewed(product.id);
              }}
              sx={{
                flex: 1,
                borderRadius: 0,
                bgcolor: "text.primary",
                py: 1.35,
                fontSize: "0.68rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                boxShadow: "none",
                "&:hover": { bgcolor: "text.secondary" },
              }}
            >
              Add to Bag
            </Button>
            <Button
              component="a"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              color="inherit"
              sx={{
                flex: 1,
                borderRadius: 0,
                py: 1.35,
                fontSize: "0.68rem",
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                borderColor: "divider",
              }}
              startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
            >
              Buy via WhatsApp
            </Button>
            <IconButton
              aria-label="Add to wishlist"
              onClick={() => toggleWishlist(product.id)}
              sx={{
                width: 48,
                height: 48,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 0,
                color: inWishlist ? "#b58a57" : "text.primary",
              }}
            >
              <FavoriteBorderIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>

          <Divider sx={{ borderColor: "divider", my: 2 }} />

          <Stack spacing={1.4}>
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.32em",
                fontSize: "0.66rem",
                color: "text.secondary",
              }}
            >
              Specifications
            </Typography>

            {specificationRows.length === 0 ? (
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                No specifications provided.
              </Typography>
            ) : (
              <Stack divider={<Divider sx={{ borderColor: "divider" }} />}>
                {specificationRows.map((value, index) => (
                  <Typography key={`${index}-${value}`} sx={{ color: "text.primary", fontSize: "0.9rem", py: 1.05 }}>
                    {value}
                  </Typography>
                ))}
              </Stack>
            )}
          </Stack>

          <Grid container spacing={1.15} sx={{ pt: 1.2 }}>
            {[
              { icon: <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />, label: "Free Delivery" },
              { icon: <ShieldOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />, label: "Authenticity Guaranteed" },
              { icon: <ReplayOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />, label: "14-Day Returns" },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                <Stack
                  spacing={0.7}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    minHeight: 82,
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                    px: 1.2,
                  }}
                >
                  {item.icon}
                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      fontSize: "0.6rem",
                      color: "text.secondary",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>

          <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", lineHeight: 1.5 }}>
            Orders are completed manually through WhatsApp concierge for delivery
            confirmation and payment guidance.
          </Typography>
        </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};
