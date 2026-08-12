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
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faPlus,
  faEnvelope,
  faPhone,
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
    // Name is always required
    if (!customerName.trim()) {
      showSnackbar("Please enter your name", "error");
      return false;
    }

    // Phone is always required (for delivery)
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

    // Email is required only if email method is selected
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

  // Submit order to backend
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
      <Alert severity="info" sx={{ borderRadius: 0 }}>
        Your cart is empty. Add a beautiful Zuriè piece to continue.
      </Alert>
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
              mt: 1,
              borderRadius: 0,
              py: 1.1,
              fontSize: "0.66rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
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
              mt: 1,
              borderRadius: 0,
              py: 1.1,
              fontSize: "0.66rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
              bgcolor: "#171512",
              "&:hover": {
                bgcolor: "#2d2a26",
                boxShadow: "none",
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
              mt: 1,
              borderRadius: 0,
              py: 1.1,
              fontSize: "0.66rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
              bgcolor: "#171512",
              "&:hover": {
                bgcolor: "#2d2a26",
                boxShadow: "none",
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
    // Phone is always shown and required
    const phoneField = (
      <Box key="phone-field">
        <Typography
          sx={{
            fontSize: "0.66rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "text.secondary",
            mt: 0.4,
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
              borderRadius: 0,
              backgroundColor: "background.default",
            },
            "& .MuiOutlinedInput-input::placeholder": {
              opacity: 0.72,
            },
          }}
        />
        <Typography
          sx={{
            fontSize: "0.65rem",
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
                fontSize: "0.65rem",
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
                fontSize: "0.66rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "text.secondary",
                mt: 0.4,
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
                  borderRadius: 0,
                  backgroundColor: "background.default",
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  opacity: 0.72,
                },
              }}
            />
            <Typography
              sx={{
                fontSize: "0.65rem",
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
                fontSize: "0.65rem",
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
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={{ xs: 4, lg: 4.4 }}
        alignItems="flex-start"
      >
        <Stack spacing={0} sx={{ flex: 1, width: "100%", minWidth: 0 }}>
          {cart.map((item) => (
            <Box
              key={item.productId}
              sx={{
                py: { xs: 2, md: 2.75 },
                borderBottom: "1px solid",
                borderColor: "divider",
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
                      bgcolor: "background.paper",
                      flexShrink: 0,
                      overflow: "hidden",
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
                    sx={{ minHeight: { sm: 146 }, py: { sm: 0.15 } }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "var(--font-playfair), serif",
                          fontSize: { xs: "1.12rem", md: "1.45rem" },
                          lineHeight: 1.1,
                        }}
                      >
                        {item.product.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.88rem",
                          mt: 0.45,
                        }}
                      >
                        Colour: {item.product.colors?.[0]?.name ?? "Classic"}
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
                          width: 30,
                          height: 30,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 0,
                        }}
                      >
                        <FontAwesomeIcon icon={faMinus} fontSize={10} />
                      </IconButton>
                      <Box
                        sx={{
                          width: 38,
                          height: 30,
                          borderTop: "1px solid",
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "0.84rem",
                        }}
                      >
                        {item.quantity}
                      </Box>
                      <IconButton
                        onClick={() =>
                          updateCartQuantity(item.productId, item.quantity + 1)
                        }
                        sx={{
                          width: 30,
                          height: 30,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 0,
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
                      fontSize: "1.1rem",
                      lineHeight: 1,
                      alignSelf: { xs: "flex-end", sm: "auto" },
                    }}
                  >
                    ×
                  </Button>
                  <Typography
                    sx={{
                      fontSize: "0.94rem",
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
              mt: 1.3,
              color: "text.secondary",
              fontSize: "0.76rem",
            }}
          >
            Clear bag
          </Link>
        </Stack>

        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", lg: 340 },
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            p: { xs: 2.2, md: 2.4 },
            position: { lg: "sticky" },
            top: { lg: 110 },
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: { xs: "1.55rem", md: "1.7rem" },
              mb: 2,
            }}
          >
            Order Summary
          </Typography>

          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ fontSize: "0.88rem", color: "text.secondary" }}>
                Subtotal
              </Typography>
              <Typography sx={{ fontSize: "0.88rem", color: "text.primary" }}>
                {formatCurrency(
                  convertFromBaseCurrency(total, currency, rates),
                  currency,
                )}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ fontSize: "0.88rem", color: "text.secondary" }}>
                Delivery
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "text.primary" }}>
                Calculated via{" "}
                {contactMethod === "whatsapp"
                  ? "WhatsApp"
                  : contactMethod === "email"
                    ? "Email"
                    : "Phone"}
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2.1, borderColor: "divider" }} />

          <Stack
            direction="row"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2.1 }}
          >
            <Typography
              sx={{
                fontSize: "0.66rem",
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
                fontSize: "1.8rem",
                lineHeight: 1,
              }}
            >
              {formatCurrency(
                convertFromBaseCurrency(total, currency, rates),
                currency,
              )}
            </Typography>
          </Stack>

          <Stack spacing={1.15}>
            <Typography
              sx={{
                fontSize: "0.66rem",
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
                  borderRadius: 0,
                  backgroundColor: "background.default",
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  opacity: 0.72,
                },
              }}
            />

            <Typography
              sx={{
                fontSize: "0.66rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "text.secondary",
                mt: 1,
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
                  borderRadius: 0,
                  borderColor: "divider",
                  py: 0.8,
                  "&.Mui-selected": {
                    backgroundColor: "#171512",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#2d2a26",
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
              mt: 1.2,
              textAlign: "center",
              color: "text.secondary",
              fontSize: "0.72rem",
              lineHeight: 1.45,
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
