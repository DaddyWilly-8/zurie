"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
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
  useMediaQuery,
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
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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

  // ── Hover Magnifier state ────────────────────────────────────────────────
  const [isHovering, setIsHovering] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [bgPosition, setBgPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Full-screen zoom fallback (mobile / click)
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  // Dynamic styles
  const getBorderColor = () =>
    isDarkMode ? "rgba(255,255,255,0.12)" : "divider";
  const getBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2";
  const getHoverBackgroundColor = () =>
    isDarkMode ? "rgba(255,255,255,0.08)" : "#f5f0ea";
  const getPrimaryTextColor = () => (isDarkMode ? "#ffffff" : "#171512");
  const getPaperBackground = () =>
    isDarkMode ? "rgba(255,255,255,0.03)" : "background.paper";

  // ── Hover Magnifier handlers ─────────────────────────────────────────────
  const LENS_SIZE = 160; // size of the square lens on the main image
  const ZOOM_LEVEL = 2.4; // how much to magnify

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imageRef.current || !isDesktop) return;

      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Keep lens inside the image bounds
      const lensX = Math.max(
        LENS_SIZE / 2,
        Math.min(x, rect.width - LENS_SIZE / 2),
      );
      const lensY = Math.max(
        LENS_SIZE / 2,
        Math.min(y, rect.height - LENS_SIZE / 2),
      );

      setLensPosition({ x: lensX - LENS_SIZE / 2, y: lensY - LENS_SIZE / 2 });

      // Background position for the magnified view
      const bgX = (lensX / rect.width) * 100;
      const bgY = (lensY / rect.height) * 100;
      setBgPosition({ x: bgX, y: bgY });
    },
    [isDesktop],
  );

  const handleMouseEnter = () => {
    if (isDesktop) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  // ── Full-screen zoom handlers (mobile fallback) ──────────────────────────
  const openZoom = () => {
    if (isDesktop) return; // desktop uses hover instead
    setIsZoomOpen(true);
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
    setZoomScale(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomScale((prev) => Math.min(Math.max(prev - e.deltaY * 0.0015, 1), 4));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - zoomPosition.x,
      y: e.clientY - zoomPosition.y,
    });
  };

  const handleMouseMoveZoom = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setZoomPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setZoomPosition({ x: 0, y: 0 });
    } else {
      setZoomScale(2.5);
    }
  };

  // ── Contact / Order handlers ─────────────────────────────────────────────
  const handleContactMethodChange = (
    _: React.MouseEvent<HTMLElement>,
    newMethod: ContactMethod | null,
  ) => {
    if (newMethod !== null) setContactMethod(newMethod);
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      setSnackbarMessage("Please enter your name");
      setShowSnackbar(true);
      return false;
    }

    if (contactMethod === "whatsapp" || contactMethod === "phone") {
      if (!customerPhone.trim()) {
        setSnackbarMessage(
          contactMethod === "whatsapp"
            ? "Please enter your WhatsApp number"
            : "Please enter your phone number",
        );
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
              "&:hover": { bgcolor: "#128C7E", boxShadow: "none" },
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
            onChange={(e) => setCustomerPhone(e.target.value)}
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
                "&:hover": { bgcolor: getHoverBackgroundColor() },
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
            onChange={(e) => setCustomerEmail(e.target.value)}
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
                "&:hover": { bgcolor: getHoverBackgroundColor() },
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
            onChange={(e) => setCustomerPhone(e.target.value)}
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
                "&:hover": { bgcolor: getHoverBackgroundColor() },
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
        {/* Breadcrumb */}
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
          {/* ── Left column – Images + Hover Magnifier ───────────────────── */}
          <Grid size={{ xs: 12, md: 6.2 }}>
            <Box sx={{ position: "relative" }}>
              {/* Main image */}
              <Box
                ref={imageRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onClick={openZoom}
                sx={{
                  position: "relative",
                  height: { xs: 380, sm: 520, md: 760 },
                  overflow: "hidden",
                  bgcolor: getPaperBackground(),
                  mb: 1.6,
                  borderRadius: 1,
                  cursor: isDesktop ? "crosshair" : "zoom-in",
                }}
              >
                <Image
                  src={activeImage || "/images/products/fallback.png"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 55vw"
                  style={{ objectFit: "cover" }}
                  priority
                />

                {/* Lens that follows the cursor */}
                {isHovering && isDesktop && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: lensPosition.x,
                      top: lensPosition.y,
                      width: LENS_SIZE,
                      height: LENS_SIZE,
                      border: "2px solid rgba(255,255,255,0.9)",
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      pointerEvents: "none",
                      zIndex: 5,
                    }}
                  />
                )}
              </Box>

              {/* Magnified preview panel (desktop only) */}
              {isHovering && isDesktop && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: "calc(100% + 24px)",
                    width: 420,
                    height: 520,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: `1px solid ${getBorderColor()}`,
                    bgcolor: getPaperBackground(),
                    zIndex: 20,
                    boxShadow: isDarkMode
                      ? "0 20px 40px rgba(0,0,0,0.5)"
                      : "0 20px 40px rgba(0,0,0,0.12)",
                    pointerEvents: "none",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      backgroundImage: `url(${activeImage || "/images/products/fallback.png"})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${ZOOM_LEVEL * 100}%`,
                      backgroundPosition: `${bgPosition.x}% ${bgPosition.y}%`,
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Thumbnail strip */}
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

          {/* ── Right column – Product info ──────────────────────────────── */}
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

              {/* Colour selector */}
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

              {/* Quantity */}
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
                    onClick={() => setQuantity((c) => Math.max(1, c - 1))}
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
                    onClick={() => setQuantity((c) => c + 1)}
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

              {/* Actions */}
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
                  onClick={() => setOpenContactDialog(true)}
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

              {/* Specifications */}
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

              {/* Trust badges */}
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

      {/* ── Contact Dialog ─────────────────────────────────────────────────── */}
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
              onChange={(e) => setCustomerName(e.target.value)}
              fullWidth
              size="medium"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  bgcolor: getBackgroundColor(),
                  "&:hover": { bgcolor: getHoverBackgroundColor() },
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

      {/* ── Full-screen Zoom (mobile fallback) ─────────────────────────────── */}
      <Dialog
        open={isZoomOpen}
        onClose={closeZoom}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            m: 0,
            width: "100vw",
            height: "100vh",
            maxWidth: "100vw",
            maxHeight: "100vh",
            borderRadius: 0,
            bgcolor: isDarkMode ? "#0d0d0d" : "#f8f6f2",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            bgcolor: isDarkMode ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.88)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: isDarkMode ? "rgba(255,255,255,0.85)" : "#171512",
            }}
          >
            {product.name} · {Math.round(zoomScale * 100)}%
          </Typography>

          <Stack direction="row" spacing={0.8}>
            <IconButton
              size="small"
              onClick={() => setZoomScale((s) => Math.min(s + 0.4, 4))}
              sx={{ color: isDarkMode ? "#fff" : "#171512" }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                setZoomScale((s) => {
                  const next = Math.max(s - 0.4, 1);
                  if (next <= 1) setZoomPosition({ x: 0, y: 0 });
                  return next;
                });
              }}
              sx={{ color: isDarkMode ? "#fff" : "#171512" }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={closeZoom}
              sx={{
                border: `1px solid ${getBorderColor()}`,
                borderRadius: 1,
                color: isDarkMode ? "#fff" : "#171512",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMoveZoom}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor:
              zoomScale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            overflow: "hidden",
            userSelect: "none",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "90vw",
              height: "85vh",
              maxWidth: 1200,
              transform: `translate(${zoomPosition.x}px, ${zoomPosition.y}px) scale(${zoomScale})`,
              transition: isDragging ? "none" : "transform 0.15s ease-out",
              transformOrigin: "center center",
            }}
          >
            <Image
              src={activeImage || "/images/products/fallback.png"}
              alt={product.name}
              fill
              sizes="90vw"
              style={{ objectFit: "contain" }}
              priority
              draggable={false}
            />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
