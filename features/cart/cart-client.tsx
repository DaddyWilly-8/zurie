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
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { SITE } from "@/constants/site";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { useShopStore } from "@/hooks/use-shop-store";
import {
  convertFromBaseCurrency,
  formatCurrency,
} from "@/utils/currency";
import {
  buildWhatsAppCheckoutLink,
  buildWhatsAppOrderMessage,
} from "@/utils/whatsapp";

export const CartClient = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const cart = useShopStore((state) => state.cart);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const updateCartQuantity = useShopStore((state) => state.updateCartQuantity);
  const clearCart = useShopStore((state) => state.clearCart);
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const checkoutLink = buildWhatsAppCheckoutLink(
    SITE.whatsappNumber,
    buildWhatsAppOrderMessage({
      customerName: customerName || "Website Customer",
      customerPhone: customerPhone || undefined,
      items: cart,
      total,
      currency,
      rates,
    }),
  );

  if (cart.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 0 }}>
        Your cart is empty. Add a beautiful Zuriè piece to continue.
      </Alert>
    );
  }

  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={{ xs: 4, lg: 4.4 }}
      alignItems="flex-start"
    >
      <Stack spacing={0} sx={{ flex: 1, width: "100%", minWidth: 0 }}>
        {cart.map((item) => (
          <Box
            key={item.productId}
            sx={{ py: { xs: 2, md: 2.75 }, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.8, sm: 2.5 }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "stretch" }}
            >
              <Stack direction="row" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
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
                    src={item.product.images?.[0]?.url ?? "/images/products/fallback.png"}
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
                      sx={{ color: "text.secondary", fontSize: "0.88rem", mt: 0.45 }}
                    >
                      Colour: {item.product.colors[0]?.name ?? "Classic"}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0} alignItems="center" sx={{ pt: 0.35 }}>
                    <IconButton
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
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
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
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
                sx={{ minWidth: { sm: 92 }, width: { xs: "100%", sm: "auto" } }}
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
                <Typography sx={{ fontSize: "0.94rem", color: "text.primary", pt: { sm: 1.5 } }}>
                  {formatCurrency(
                    convertFromBaseCurrency(item.product.price * item.quantity, currency, rates),
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
              {formatCurrency(convertFromBaseCurrency(total, currency, rates), currency)}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography sx={{ fontSize: "0.88rem", color: "text.secondary" }}>
              Delivery
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "text.primary" }}>
              Calculated via WhatsApp
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2.1, borderColor: "divider" }} />

        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 2.1 }}>
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
            {formatCurrency(convertFromBaseCurrency(total, currency, rates), currency)}
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
              mt: 0.4,
            }}
          >
            Phone (Optional)
          </Typography>
          <TextField
            placeholder="WhatsApp number"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
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

          <Button
            component="a"
            href={checkoutLink}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="success"
            disabled={!customerName.trim()}
            sx={{
              mt: 1,
              borderRadius: 0,
              py: 1.1,
              fontSize: "0.66rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              boxShadow: "none",
            }}
          >
            Complete via WhatsApp
          </Button>
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
          Your order details open in WhatsApp for personal concierge and
          manual payment.
        </Typography>
      </Box>
    </Stack>
  );
};
