"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  useTheme,
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

type ContactMethod = "whatsapp" | "email" | "phone";

export const ProductDetailClient = ({
  product,
  categoryLabel,
}: {
  product: Product;
  categoryLabel: string;
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const productImages = product.images ?? [];
  const [activeImage, setActiveImage] = useState(productImages[0]?.url ?? "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("whatsapp");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openContactDialog, setOpenContactDialog] = useState(false);

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

  // Dynamic styles based on dark mode
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "divider";
  const getBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2";
  const getHoverBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.08)" : "#f5f0ea";
  const getTextColor = () =>
    isDarkMode ? "rgba(255,255,255,0.7)" : "text.secondary";
  const getPrimaryTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getPaperBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper";
  const getIconColor = () => (isDarkMode ? "rgba(255,255,255,0.5)" : "#999");

  const handleContactMethodChange = (
    _: React.MouseEvent<HTMLElement>,
    newMethod: ContactMethod | null,
  ) => {
    if (newMethod !== null) {
      setContactMethod(newMethod);
    }
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      setSnackbarMessage("Please enter your name");
      setShowSnackbar(true);
      return false;
    }

    if (contactMethod === "whatsapp") {
      if (!customerPhone.trim()) {
        setSnackbarMessage("Please enter your WhatsApp number");
        setShowSnackbar(true);
        return false;
      }
      const phoneDigits = customerPhone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        setSnackbarMessage(
          "Please enter a valid phone number (at least 10 digits)",
        );
        setShowSnackbar(true);
        return false;
      }
    }

    if (contactMethod === "email") {
      if (!customerEmail.trim()) {
        setSnackbarMessage("Please enter your email address");
        setShowSnackbar(true);
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        setSnackbarMessage("Please enter a valid email address");
        setShowSnackbar(true);
        return false;
      }
    }

    if (contactMethod === "phone") {
      if (!customerPhone.trim()) {
        setSnackbarMessage("Please enter your phone number");
        setShowSnackbar(true);
        return false;
      }
      const phoneDigits = customerPhone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        setSnackbarMessage(
          "Please enter a valid phone number (at least 10 digits)",
        );
        setShowSnackbar(true);
        return false;
      }
    }

    return true;
  };

  const handleWhatsAppCheckout = () => {
    if (!validateForm()) return;

    const orderMessage = buildWhatsAppOrderMessage({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
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
      contactMethod,
    });

    const checkoutLink = buildWhatsAppCheckoutLink(
      SITE.whatsappNumber,
      orderMessage,
    );

    window.open(checkoutLink, "_blank", "noopener,noreferrer");
    setOpenContactDialog(false);
  };

  const handleEmailOrder = () => {
    if (!validateForm()) return;

    const orderMessage = buildWhatsAppOrderMessage({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
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
      contactMethod: "email",
    });

    const subject = encodeURIComponent(
      `New Order from ${customerName.trim()} - Zuriè`,
    );
    const body = encodeURIComponent(orderMessage);
    const mailtoLink = `mailto:${SITE.contactEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, "_blank");
    setOpenContactDialog(false);
  };

  const handlePhoneOrder = () => {
    if (!validateForm()) return;

    const orderMessage = buildWhatsAppOrderMessage({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
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
      contactMethod: "phone",
    });

    const storePhone = SITE.contactPhone.replace(/\D/g, "");
    const smsLink = `sms:${storePhone}?body=${encodeURIComponent(orderMessage)}`;
    window.open(smsLink, "_blank");
    setOpenContactDialog(false);
  };

  const handleOpenContactDialog = () => {
    setOpenContactDialog(true);
  };

  const getCheckoutButton = () => {
    switch (contactMethod) {
      case "whatsapp":
        return (
          <Button
            onClick={handleWhatsAppCheckout}
            variant="contained"
            fullWidth
            startIcon={<WhatsAppIcon />}
            sx={{
              borderRadius: 0,
              py: 1.2,
              fontSize: "0.68rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
              bgcolor: "#25D366",
              "&:hover": {
                bgcolor: "#128C7E",
                boxShadow: "none",
              },
            }}
          >
            Complete via WhatsApp
          </Button>
        );
      case "email":
        return (
          <Button
            onClick={handleEmailOrder}
            variant="contained"
            fullWidth
            startIcon={<EmailIcon />}
            sx={{
              borderRadius: 0,
              py: 1.2,
              fontSize: "0.68rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
                boxShadow: "none",
              },
            }}
          >
            Send via Email
          </Button>
        );
      case "phone":
        return (
          <Button
            onClick={handlePhoneOrder}
            variant="contained"
            fullWidth
            startIcon={<PhoneIcon />}
            sx={{
              borderRadius: 0,
              py: 1.2,
              fontSize: "0.68rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
                boxShadow: "none",
              },
            }}
          >
            Send via SMS
          </Button>
        );
      default:
        return null;
    }
  };

  const getContactField = () => {
    switch (contactMethod) {
      case "whatsapp":
        return (
          <TextField
            label="WhatsApp Number *"
            placeholder="+255 123 456 789"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            fullWidth
            size="medium"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WhatsAppIcon sx={{ color: "#25D366" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                bgcolor: getBackgroundColor(),
                "&:hover": {
                  bgcolor: getHoverBackgroundColor(),
                },
              },
              "& .MuiInputBase-input": {
                color: isDarkMode ? "#ffffff" : "inherit",
              },
              "& .MuiInputLabel-root": {
                color: isDarkMode ? "rgba(255,255,255,0.7)" : "inherit",
              },
            }}
          />
        );
      case "email":
        return (
          <TextField
            label="Email Address *"
            placeholder="you@example.com"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            fullWidth
            size="medium"
            required
            type="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon
                    sx={{ color: isDarkMode ? "#ffffff" : "#171512" }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                bgcolor: getBackgroundColor(),
                "&:hover": {
                  bgcolor: getHoverBackgroundColor(),
                },
              },
              "& .MuiInputBase-input": {
                color: isDarkMode ? "#ffffff" : "inherit",
              },
              "& .MuiInputLabel-root": {
                color: isDarkMode ? "rgba(255,255,255,0.7)" : "inherit",
              },
            }}
          />
        );
      case "phone":
        return (
          <TextField
            label="Phone Number *"
            placeholder="+255 123 456 789"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            fullWidth
            size="medium"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon
                    sx={{ color: isDarkMode ? "#ffffff" : "#171512" }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                bgcolor: getBackgroundColor(),
                "&:hover": {
                  bgcolor: getHoverBackgroundColor(),
                },
              },
              "& .MuiInputBase-input": {
                color: isDarkMode ? "#ffffff" : "inherit",
              },
              "& .MuiInputLabel-root": {
                color: isDarkMode ? "rgba(255,255,255,0.7)" : "inherit",
              },
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />

      <Stack spacing={{ xs: 4, md: 5.5 }}>
        <Typography
          component="div"
          sx={{
            color: isDarkMode ? "rgba(255,255,255,0.6)" : "text.secondary",
            fontSize: "0.76rem",
            display: "flex",
            gap: 0.8,
            flexWrap: "wrap",
          }}
        >
          <Typography
            component={Link}
            href="/"
            sx={{
              color: "inherit",
              textDecoration: "none",
              fontSize: "inherit",
            }}
          >
            Home
          </Typography>
          /
          <Typography
            component={Link}
            href="/shop"
            sx={{
              color: "inherit",
              textDecoration: "none",
              fontSize: "inherit",
            }}
          >
            Shop
          </Typography>
          /
          <Typography
            sx={{
              color: isDarkMode ? "#ffffff" : "text.primary",
              fontSize: "inherit",
            }}
          >
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
                bgcolor: getPaperBackground(),
                mb: 1.6,
                borderRadius: 1,
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
            <Stack
              direction="row"
              spacing={1.25}
              sx={{ overflowX: "auto", pb: 0.4 }}
            >
              {productImages.map((image) => (
                <Button
                  key={image.url}
                  onClick={() => setActiveImage(image.url)}
                  sx={{
                    p: 0,
                    minWidth: 0,
                    border: "1px solid",
                    borderColor:
                      activeImage === image.url
                        ? getPrimaryTextColor()
                        : getBorderColor(),
                    borderRadius: 1,
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
                  color: isDarkMode ? "#b89a73" : "#b89a73",
                }}
              >
                {categoryLabel}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-playfair), serif",
                  fontSize: { xs: "2.3rem", md: "3.4rem" },
                  lineHeight: 0.98,
                  color: isDarkMode ? "#ffffff" : "inherit",
                }}
              >
                {product.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "1.55rem", md: "1.9rem" },
                  color: isDarkMode ? "#ffffff" : "inherit",
                }}
              >
                {formatBaseCurrencyInCurrency(product.price, currency, rates)}
              </Typography>

              <Typography
                sx={{
                  color: product.inStock
                    ? isDarkMode
                      ? "#a8c99e"
                      : "#9c835d"
                    : "error.main",
                  fontSize: "0.9rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                {product.inStock ? <CheckIcon sx={{ fontSize: 14 }} /> : null}
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Typography>

              <Typography
                sx={{
                  color: isDarkMode
                    ? "rgba(255,255,255,0.7)"
                    : "text.secondary",
                  maxWidth: 560,
                  lineHeight: 1.7,
                }}
              >
                {product.description}
              </Typography>

              <Stack spacing={1.1} sx={{ pt: 1.1 }}>
                <Typography
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.32em",
                    fontSize: "0.65rem",
                    color: isDarkMode
                      ? "rgba(255,255,255,0.6)"
                      : "text.secondary",
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
                          borderColor: isActive
                            ? "primary.main"
                            : getBorderColor(),
                          bgcolor: isActive
                            ? "action.selected"
                            : "background.paper",
                          color: isDarkMode ? "#ffffff" : "text.primary",
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
                    color: isDarkMode
                      ? "rgba(255,255,255,0.6)"
                      : "text.secondary",
                  }}
                >
                  Quantity
                </Typography>

                <Stack direction="row" spacing={0} alignItems="center">
                  <IconButton
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    sx={{
                      width: 34,
                      height: 34,
                      border: "1px solid",
                      borderColor: getBorderColor(),
                      borderRadius: 0,
                      color: isDarkMode ? "#ffffff" : "inherit",
                    }}
                  >
                    <RemoveIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Box
                    sx={{
                      width: 44,
                      height: 34,
                      borderTop: "1px solid",
                      borderBottom: "1px solid",
                      borderColor: getBorderColor(),
                      display: "grid",
                      placeItems: "center",
                      fontSize: "0.9rem",
                      color: isDarkMode ? "#ffffff" : "inherit",
                    }}
                  >
                    {quantity}
                  </Box>
                  <IconButton
                    onClick={() => setQuantity((current) => current + 1)}
                    sx={{
                      width: 34,
                      height: 34,
                      border: "1px solid",
                      borderColor: getBorderColor(),
                      borderRadius: 0,
                      color: isDarkMode ? "#ffffff" : "inherit",
                    }}
                  >
                    <AddIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ pt: 0.5 }}
              >
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
                    bgcolor: isDarkMode ? "#ffffff" : "text.primary",
                    color: isDarkMode ? "#171512" : "#ffffff",
                    py: 1.35,
                    fontSize: "0.68rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: isDarkMode
                        ? "rgba(255,255,255,0.9)"
                        : "text.secondary",
                      boxShadow: "none",
                    },
                  }}
                >
                  Add to Bag
                </Button>
                <Button
                  onClick={handleOpenContactDialog}
                  variant="outlined"
                  color="inherit"
                  sx={{
                    flex: 1,
                    borderRadius: 0,
                    py: 1.35,
                    fontSize: "0.68rem",
                    letterSpacing: "0.5em",
                    textTransform: "uppercase",
                    borderColor: getBorderColor(),
                    gap: 0.5,
                    color: isDarkMode ? "#ffffff" : "inherit",
                  }}
                  endIcon={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <WhatsAppIcon sx={{ fontSize: 16, color: "#25D366" }} />
                      <EmailIcon
                        sx={{
                          fontSize: 16,
                          color: isDarkMode ? "#ffffff" : "#171512",
                        }}
                      />
                      <PhoneIcon
                        sx={{
                          fontSize: 16,
                          color: isDarkMode ? "#ffffff" : "#171512",
                        }}
                      />
                    </Stack>
                  }
                >
                  Buy
                </Button>
                <IconButton
                  aria-label="Add to wishlist"
                  onClick={() => toggleWishlist(product.id)}
                  sx={{
                    width: 48,
                    height: 48,
                    border: "1px solid",
                    borderColor: getBorderColor(),
                    borderRadius: 0,
                    color: inWishlist
                      ? "#b58a57"
                      : isDarkMode
                        ? "#ffffff"
                        : "text.primary",
                  }}
                >
                  <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>

              <Divider sx={{ borderColor: getBorderColor(), my: 2 }} />

              <Stack spacing={1.4}>
                <Typography
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.32em",
                    fontSize: "0.66rem",
                    color: isDarkMode
                      ? "rgba(255,255,255,0.6)"
                      : "text.secondary",
                  }}
                >
                  Specifications
                </Typography>

                {specificationRows.length === 0 ? (
                  <Typography
                    sx={{
                      color: isDarkMode
                        ? "rgba(255,255,255,0.5)"
                        : "text.secondary",
                      fontSize: "0.9rem",
                    }}
                  >
                    No specifications provided.
                  </Typography>
                ) : (
                  <Stack
                    divider={<Divider sx={{ borderColor: getBorderColor() }} />}
                  >
                    {specificationRows.map((value, index) => (
                      <Typography
                        key={`${index}-${value}`}
                        sx={{
                          color: isDarkMode ? "#ffffff" : "text.primary",
                          fontSize: "0.9rem",
                          py: 1.05,
                        }}
                      >
                        {value}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Stack>

              <Grid container spacing={1.15} sx={{ pt: 1.2 }}>
                {[
                  {
                    icon: (
                      <LocalShippingOutlinedIcon
                        sx={{ fontSize: 16, color: "primary.main" }}
                      />
                    ),
                    label: "Free Delivery",
                  },
                  {
                    icon: (
                      <ShieldOutlinedIcon
                        sx={{ fontSize: 16, color: "primary.main" }}
                      />
                    ),
                    label: "Authenticity Guaranteed",
                  },
                  {
                    icon: (
                      <ReplayOutlinedIcon
                        sx={{ fontSize: 16, color: "primary.main" }}
                      />
                    ),
                    label: "14-Day Returns",
                  },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
                    <Stack
                      spacing={0.7}
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        minHeight: 82,
                        border: "1px solid",
                        borderColor: getBorderColor(),
                        textAlign: "center",
                        px: 1.2,
                        borderRadius: 1,
                      }}
                    >
                      {item.icon}
                      <Typography
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.18em",
                          fontSize: "0.6rem",
                          color: isDarkMode
                            ? "rgba(255,255,255,0.6)"
                            : "text.secondary",
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>

              <Typography
                sx={{
                  color: isDarkMode
                    ? "rgba(255,255,255,0.5)"
                    : "text.secondary",
                  fontSize: "0.78rem",
                  lineHeight: 1.5,
                }}
              >
                Orders are completed manually through WhatsApp concierge for
                delivery confirmation and payment guidance.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      {/* Contact Dialog */}
      <Dialog
        open={openContactDialog}
        onClose={() => setOpenContactDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 0,
            bgcolor: isDarkMode ? "#1a1a1a" : "#ffffff",
          },
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack spacing={0.5}>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ color: isDarkMode ? "#ffffff" : "#171512" }}
              >
                Place Order
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode
                    ? "rgba(255,255,255,0.6)"
                    : "text.secondary",
                }}
              >
                {product.name} × {quantity} —{" "}
                {formatBaseCurrencyInCurrency(
                  product.price * quantity,
                  currency,
                  rates,
                )}
              </Typography>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setOpenContactDialog(false)}
              sx={{
                border: `1px solid ${getBorderColor()}`,
                borderRadius: 1,
                p: 0.5,
                color: isDarkMode ? "#ffffff" : "inherit",
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Stack spacing={2.5} paddingTop={1}>
            <TextField
              label="Your Name"
              placeholder="Enter your full name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              fullWidth
              size="medium"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: getBackgroundColor(),
                  "&:hover": {
                    bgcolor: getHoverBackgroundColor(),
                  },
                },
                "& .MuiInputBase-input": {
                  color: isDarkMode ? "#ffffff" : "inherit",
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode ? "rgba(255,255,255,0.7)" : "inherit",
                },
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: isDarkMode
                    ? "rgba(255,255,255,0.5)"
                    : "text.secondary",
                  mb: 1.5,
                }}
              >
                Contact Method *
              </Typography>
              <ToggleButtonGroup
                value={contactMethod}
                exclusive
                onChange={handleContactMethodChange}
                aria-label="contact method"
                sx={{
                  width: "100%",
                  "& .MuiToggleButtonGroup-grouped": {
                    flex: 1,
                    borderRadius: 1,
                    borderColor: getBorderColor(),
                    py: 1.2,
                    px: 1,
                    color: isDarkMode ? "rgba(255,255,255,0.7)" : "#171512",
                    "&.Mui-selected": {
                      bgcolor: isDarkMode ? "#ffffff" : "#171512",
                      color: isDarkMode ? "#171512" : "#ffffff",
                      "&:hover": {
                        bgcolor: isDarkMode
                          ? "rgba(255,255,255,0.9)"
                          : "#2d2a26",
                      },
                    },
                    "&:not(.Mui-selected)": {
                      bgcolor: isDarkMode
                        ? "rgba(255,255,255,0.03)"
                        : "background.paper",
                      "&:hover": {
                        bgcolor: isDarkMode
                          ? "rgba(255,255,255,0.06)"
                          : "#f8f6f2",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="whatsapp" aria-label="WhatsApp">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <WhatsAppIcon sx={{ fontSize: 20, color: "#25D366" }} />
                    <Typography variant="body2" fontWeight={500}>
                      WhatsApp
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="email" aria-label="Email">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EmailIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={500}>
                      Email
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="phone" aria-label="Phone">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PhoneIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={500}>
                      Phone
                    </Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: isDarkMode
                    ? "rgba(255,255,255,0.5)"
                    : "text.secondary",
                  mb: 1,
                }}
              >
                {contactMethod === "whatsapp" && "WhatsApp Number *"}
                {contactMethod === "email" && "Email Address *"}
                {contactMethod === "phone" && "Phone Number *"}
              </Typography>
              {getContactField()}
            </Box>

            <Typography
              sx={{
                fontSize: "0.7rem",
                color: isDarkMode ? "rgba(255,255,255,0.4)" : "text.secondary",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              {contactMethod === "whatsapp" &&
                "We'll contact you via WhatsApp to confirm your order"}
              {contactMethod === "email" &&
                "We'll send your order confirmation to your email"}
              {contactMethod === "phone" &&
                "We'll call or SMS you to confirm your order"}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          {getCheckoutButton()}
        </DialogActions>
      </Dialog>
    </>
  );
};
