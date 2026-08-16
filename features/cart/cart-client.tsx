"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Paper,
  useTheme,
  Fade,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faPlus,
  faEnvelope,
  faPhone,
  faTrashAlt,
  faShoppingBag,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { SITE } from "@/constants/site";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { useShopStore } from "@/hooks/use-shop-store";
import {
  convertFromBaseCurrency,
  formatCurrency,
  type CurrencyCode,
  type CurrencyRateMap,
} from "@/utils/currency";
import {
  buildWhatsAppCheckoutLink,
  buildWhatsAppOrderMessage,
} from "@/utils/whatsapp";
import {
  orderService,
  type CreateOrderPayload,
} from "@/services/orders/order.service";

type ContactMethod = "whatsapp" | "email" | "phone";

export const CartClient = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("whatsapp");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cart = useShopStore((state) => state.cart);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const updateCartQuantity = useShopStore((state) => state.updateCartQuantity);
  const clearCart = useShopStore((state) => state.clearCart);
  const currency = useCurrencyStore((state) => state.currency) as CurrencyCode;
  const rates = useCurrencyStore(
    (state) => state.rates,
  ) as Partial<CurrencyRateMap>;

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const handleContactMethodChange = (
    _: React.MouseEvent<HTMLElement>,
    newMethod: ContactMethod | null,
  ) => {
    if (newMethod !== null) {
      setContactMethod(newMethod);
    }
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info",
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      showSnackbar("Please enter your name", "error");
      return false;
    }

    if (!customerPhone.trim()) {
      showSnackbar("Please enter your phone number", "error");
      return false;
    }
    const phoneDigits = customerPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      showSnackbar(
        "Please enter a valid phone number (at least 10 digits)",
        "error",
      );
      return false;
    }

    if (contactMethod === "email") {
      if (!customerEmail.trim()) {
        showSnackbar("Please enter your email address", "error");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        showSnackbar("Please enter a valid email address", "error");
        return false;
      }
    }

    return true;
  };

  const submitOrderToBackend = async (): Promise<boolean> => {
    try {
      setIsSubmitting(true);

      const orderPayload: CreateOrderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        whatsappNumber: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        items: cart.map((item) => ({
          productId: parseInt(item.productId, 10) || item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await orderService.createOrder(orderPayload);

      if (response && response.success) {
        showSnackbar("Order submitted successfully!", "success");
        return true;
      }

      return true;
    } catch (error) {
      console.error("Failed to submit order:", error);

      let errorMessage = "Failed to submit order. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Insufficient stock")) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message || errorMessage;
        }
      }

      showSnackbar(errorMessage, "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (!validateForm()) return;

    const submitted = await submitOrderToBackend();
    if (!submitted) return;

    const orderMessage = buildWhatsAppOrderMessage({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      items: cart,
      total,
      currency,
      rates,
      contactMethod,
    });

    const checkoutLink = buildWhatsAppCheckoutLink(
      SITE.whatsappNumber,
      orderMessage,
    );

    window.open(checkoutLink, "_blank", "noopener,noreferrer");
    clearCart();
  };

  const handleEmailOrder = async () => {
    if (!validateForm()) return;

    const submitted = await submitOrderToBackend();
    if (!submitted) return;

    const orderMessage = buildWhatsAppOrderMessage({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      items: cart,
      total,
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
    clearCart();
  };

  const handlePhoneOrder = async () => {
    if (!validateForm()) return;

    const submitted = await submitOrderToBackend();
    if (!submitted) return;

    const orderMessage = buildWhatsAppOrderMessage({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      items: cart,
      total,
      currency,
      rates,
      contactMethod: "phone",
    });

    const storePhone = SITE.contactPhone.replace(/\D/g, "");
    const smsLink = `sms:${storePhone}?body=${encodeURIComponent(orderMessage)}`;
    window.open(smsLink, "_blank");
    clearCart();
  };

  if (cart.length === 0) {
    return (
      <Fade in timeout={500}>
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 6, md: 10 },
            px: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8f6f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
            }}
          >
            <FontAwesomeIcon
              icon={faShoppingBag}
              style={{
                fontSize: 32,
                color: isDarkMode ? "rgba(255,255,255,0.3)" : "#b39a72",
              }}
            />
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "1.5rem", md: "2rem" },
              color: "text.primary",
              mb: 1,
            }}
          >
            Your cart is empty
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.95rem",
              mb: 2.5,
            }}
          >
            Add a beautiful Zuriè piece to continue.
          </Typography>
          <Button
            component={Link}
            href="/shop"
            variant="contained"
            endIcon={<FontAwesomeIcon icon={faArrowRight} />}
            sx={{
              borderRadius: 0,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontSize: "0.7rem",
              px: 3.5,
              py: 1.2,
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
              },
            }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Fade>
    );
  }

  const getCheckoutButton = () => {
    switch (contactMethod) {
      case "whatsapp":
        return (
          <Button
            onClick={handleWhatsAppCheckout}
            variant="contained"
            color="success"
            disabled={
              !customerName.trim() || !customerPhone.trim() || isSubmitting
            }
            startIcon={<FontAwesomeIcon icon={faWhatsapp} />}
            sx={{
              mt: 1.5,
              borderRadius: 1.5,
              py: 1.3,
              fontSize: "0.7rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
              bgcolor: "#25D366",
              "&:hover": {
                bgcolor: "#1da851",
                boxShadow: "0 4px 16px rgba(37,211,102,0.3)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {isSubmitting ? "Processing..." : "Complete via WhatsApp"}
          </Button>
        );
      case "email":
        return (
          <Button
            onClick={handleEmailOrder}
            variant="contained"
            color="primary"
            disabled={
              !customerName.trim() ||
              !customerPhone.trim() ||
              !customerEmail.trim() ||
              isSubmitting
            }
            startIcon={<FontAwesomeIcon icon={faEnvelope} />}
            sx={{
              mt: 1.5,
              borderRadius: 1.5,
              py: 1.3,
              fontSize: "0.7rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              },
            }}
          >
            {isSubmitting ? "Processing..." : "Send via Email"}
          </Button>
        );
      case "phone":
        return (
          <Button
            onClick={handlePhoneOrder}
            variant="contained"
            color="primary"
            disabled={
              !customerName.trim() || !customerPhone.trim() || isSubmitting
            }
            startIcon={<FontAwesomeIcon icon={faPhone} />}
            sx={{
              mt: 1.5,
              borderRadius: 1.5,
              py: 1.3,
              fontSize: "0.7rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
              bgcolor: isDarkMode ? "#ffffff" : "#171512",
              color: isDarkMode ? "#171512" : "#ffffff",
              "&:hover": {
                bgcolor: isDarkMode ? "rgba(255,255,255,0.9)" : "#2d2a26",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              },
            }}
          >
            {isSubmitting ? "Processing..." : "Send via SMS"}
          </Button>
        );
      default:
        return null;
    }
  };

  const getContactFields = () => {
    const phoneField = (
      <Box key="phone-field">
        <Typography
          sx={{
            fontSize: "0.65rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "text.secondary",
            mt: 0.4,
            mb: 0.5,
          }}
        >
          Phone Number *
        </Typography>
        <TextField
          placeholder="+255 *** *** ***"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          size="small"
          required
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.03)"
                : "#f8f6f2",
            },
            "& .MuiOutlinedInput-input::placeholder": {
              opacity: 0.72,
            },
          }}
        />
        <Typography
          sx={{
            fontSize: "0.6rem",
            color: "text.secondary",
            mt: 0.5,
            fontStyle: "italic",
          }}
        >
          We need your phone number for delivery coordination
        </Typography>
      </Box>
    );

    switch (contactMethod) {
      case "whatsapp":
        return (
          <>
            {phoneField}
            <Typography
              sx={{
                fontSize: "0.6rem",
                color: "text.secondary",
                mt: 0.5,
                fontStyle: "italic",
              }}
            >
              We&apos;ll also contact you via WhatsApp to confirm your order
            </Typography>
          </>
        );
      case "email":
        return (
          <>
            {phoneField}
            <Typography
              sx={{
                fontSize: "0.65rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "text.secondary",
                mt: 0.4,
                mb: 0.5,
              }}
            >
              Email Address *
            </Typography>
            <TextField
              placeholder="you@example.com"
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              size="small"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.03)"
                    : "#f8f6f2",
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  opacity: 0.72,
                },
              }}
            />
            <Typography
              sx={{
                fontSize: "0.6rem",
                color: "text.secondary",
                mt: 0.5,
                fontStyle: "italic",
              }}
            >
              We&apos;ll send your order confirmation to your email
            </Typography>
          </>
        );
      case "phone":
        return (
          <>
            {phoneField}
            <Typography
              sx={{
                fontSize: "0.6rem",
                color: "text.secondary",
                mt: 0.5,
                fontStyle: "italic",
              }}
            >
              We&apos;ll call or SMS you to confirm your order
            </Typography>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%", borderRadius: 1.5 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={{ xs: 4, lg: 4.4 }}
        alignItems="flex-start"
      >
        {/* Cart Items */}
        <Stack spacing={0} sx={{ flex: 1, width: "100%", minWidth: 0 }}>
          {cart.map((item, index) => (
            <Box
              key={item.productId}
              sx={{
                py: { xs: 2.5, md: 3 },
                borderBottom: index < cart.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#faf8f5",
                  px: 1,
                  mx: -1,
                  borderRadius: 1,
                },
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1.8, sm: 2.5 }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "stretch" }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ minWidth: 0, flex: 1 }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: 88, md: 118 },
                      height: { xs: 112, md: 146 },
                      bgcolor: isDarkMode
                        ? "rgba(255,255,255,0.03)"
                        : "#f8f6f2",
                      flexShrink: 0,
                      overflow: "hidden",
                      borderRadius: 1.5,
                    }}
                  >
                    <Image
                      src={
                        item.product.images?.[0]?.url ??
                        "/images/products/fallback.png"
                      }
                      alt={item.product.images?.[0]?.alt ?? item.product.name}
                      fill
                      sizes="(max-width: 600px) 88px, 104px"
                      style={{ objectFit: "cover" }}
                    />
                  </Box>

                  <Stack
                    justifyContent="space-between"
                    sx={{ minHeight: { sm: 146 }, py: { sm: 0.15 }, flex: 1 }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-playfair), serif",
                          fontSize: { xs: "1rem", md: "1.3rem" },
                          lineHeight: 1.2,
                          color: "text.primary",
                        }}
                      >
                        {item.product.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.8rem",
                          mt: 0.25,
                        }}
                      >
                        {item.product.colors?.[0]?.name ?? "Classic"}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={0}
                      alignItems="center"
                      sx={{ pt: 0.35 }}
                    >
                      <IconButton
                        onClick={() =>
                          updateCartQuantity(item.productId, item.quantity - 1)
                        }
                        sx={{
                          width: 32,
                          height: 32,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <FontAwesomeIcon icon={faMinus} fontSize={10} />
                      </IconButton>
                      <Box
                        sx={{
                          width: 40,
                          height: 32,
                          borderTop: "1px solid",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "0.84rem",
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        {item.quantity}
                      </Box>
                      <IconButton
                        onClick={() =>
                          updateCartQuantity(item.productId, item.quantity + 1)
                        }
                        sx={{
                          width: 32,
                          height: 32,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} fontSize={10} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>
                <Stack
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "flex-end" }}
                  sx={{
                    minWidth: { sm: 92 },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Button
                    variant="text"
                    onClick={() => removeFromCart(item.productId)}
                    sx={{
                      minWidth: "auto",
                      p: 0,
                      color: "text.secondary",
                      fontSize: "1rem",
                      lineHeight: 1,
                      alignSelf: { xs: "flex-end", sm: "auto" },
                      "&:hover": {
                        color: "error.main",
                      },
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} fontSize={14} />
                  </Button>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "text.primary",
                      pt: { sm: 1.5 },
                    }}
                  >
                    {formatCurrency(
                      convertFromBaseCurrency(
                        item.product.price * item.quantity,
                        currency,
                        rates,
                      ),
                      currency,
                    )}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          ))}

          <Link
            component="button"
            onClick={clearCart}
            underline="always"
            sx={{
              alignSelf: "flex-start",
              mt: 1.5,
              color: "text.secondary",
              fontSize: "0.76rem",
              "&:hover": {
                color: "error.main",
              },
            }}
          >
            Clear bag
          </Link>
        </Stack>

        {/* Order Summary */}
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", lg: 340 },
            bgcolor: isDarkMode ? "rgba(255,255,255,0.02)" : "#faf8f5",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: { xs: 2.5, md: 3 },
            position: { lg: "sticky" },
            top: { lg: 110 },
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "1.4rem", md: "1.6rem" },
              mb: 2.5,
              color: "text.primary",
            }}
          >
            Order Summary
          </Typography>

          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                Subtotal ({cart.length} items)
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "text.primary",
                }}
              >
                {formatCurrency(
                  convertFromBaseCurrency(total, currency, rates),
                  currency,
                )}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                Delivery
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                Calculated via{" "}
                {contactMethod === "whatsapp"
                  ? "WhatsApp"
                  : contactMethod === "email"
                    ? "Email"
                    : "Phone"}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2.5, borderColor: "divider" }} />

          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              Total
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: { xs: "1.6rem", md: "1.8rem" },
                lineHeight: 1,
                color: "text.primary",
              }}
            >
              {formatCurrency(
                convertFromBaseCurrency(total, currency, rates),
                currency,
              )}
            </Typography>
          </Stack>

          <Stack spacing={1.5}>
            <Typography
              sx={{
                fontSize: "0.65rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              Your Name *
            </Typography>
            <TextField
              placeholder="Full name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.03)"
                    : "#ffffff",
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  opacity: 0.72,
                },
              }}
            />

            <Typography
              sx={{
                fontSize: "0.65rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              Contact Method *
            </Typography>
            <ToggleButtonGroup
              value={contactMethod}
              exclusive
              onChange={handleContactMethodChange}
              aria-label="contact method"
              size="small"
              sx={{
                width: "100%",
                "& .MuiToggleButtonGroup-grouped": {
                  flex: 1,
                  borderRadius: 1.5,
                  borderColor: "divider",
                  py: 1,
                  fontSize: "0.7rem",
                  textTransform: "none",
                  "&.Mui-selected": {
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.1)"
                      : "#171512",
                    color: isDarkMode ? "#ffffff" : "#ffffff",
                    "&:hover": {
                      backgroundColor: isDarkMode
                        ? "rgba(255,255,255,0.15)"
                        : "#2d2a26",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="whatsapp" aria-label="WhatsApp">
                <FontAwesomeIcon icon={faWhatsapp} style={{ marginRight: 6 }} />
                WhatsApp
              </ToggleButton>
              <ToggleButton value="email" aria-label="Email">
                <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 6 }} />
                Email
              </ToggleButton>
              <ToggleButton value="phone" aria-label="Phone">
                <FontAwesomeIcon icon={faPhone} style={{ marginRight: 6 }} />
                Phone
              </ToggleButton>
            </ToggleButtonGroup>

            {getContactFields()}

            {getCheckoutButton()}
          </Stack>

          <Typography
            sx={{
              mt: 1.5,
              textAlign: "center",
              color: "text.secondary",
              fontSize: "0.68rem",
              lineHeight: 1.5,
            }}
          >
            Your order details will be sent via{" "}
            {contactMethod === "whatsapp"
              ? "WhatsApp"
              : contactMethod === "email"
                ? "email"
                : "SMS"}{" "}
            for personal concierge and payment processing.
          </Typography>
        </Box>
      </Stack>
    </>
  );
};
