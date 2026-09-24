"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useShopStore } from "@/hooks/use-shop-store";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { orderService } from "@/services/orders/order.service";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";
import { summarizeVat } from "@/utils/vat";
import { couponService } from "@/services/coupons/coupon.service";
import { ApiError } from "@/services/api/client";
import { useSiteSettings } from "@/providers/settings-provider";
import { useOptionalCustomerAuth } from "@/providers/customer-auth-provider";
import { accountService } from "@/services/account/account.service";

const firstImageUrl = (
  item: ReturnType<typeof useShopStore.getState>["cart"][number],
) => item.product.images?.[0]?.url ?? "/images/placeholder.png";

export const CartClient = () => {
  const cart = useShopStore((state) => state.cart);
  const updateCartQuantity = useShopStore((state) => state.updateCartQuantity);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const clearCart = useShopStore((state) => state.clearCart);
  const { currency, rates } = useCurrencyStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const { tax } = useSiteSettings();

  // Signed-in customers get their saved details filled in; the order is
  // filed under their account server-side either way.
  const isSignedIn = Boolean(useOptionalCustomerAuth()?.isAuthenticated);
  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    accountService
      .getProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setName((value) => value || profile.name);
        setPhone((value) => value || profile.phone);
        setWhatsapp((value) => value || profile.whatsappNumber || "");
        setEmail((value) => value || profile.email || "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const lines = useMemo(
    () =>
      cart.map((item) => ({
        amount: item.product.price * item.quantity,
        vatExempted: item.product.vatExempted,
      })),
    [cart],
  );
  const cartSubtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.amount, 0),
    [lines],
  );
  const { subtotal, discount, vat, total } = useMemo(
    () => summarizeVat(lines, tax, coupon?.discount ?? 0),
    [lines, tax, coupon],
  );

  // Prices are TZS; the backend works out the discount (and whether the
  // code is valid for this subtotal), so re-check it whenever the cart
  // changes rather than trusting a stale amount.
  const applyCoupon = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setApplyingCoupon(true);
    setCouponError(null);
    try {
      const result = await couponService.preview(trimmed, cartSubtotal);
      setCoupon({ code: trimmed, discount: result.discountAmount });
    } catch (err) {
      setCoupon(null);
      setCouponError(
        err instanceof ApiError ? err.message : "This code can't be applied.",
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  useEffect(() => {
    if (coupon && cartSubtotal > 0) void applyCoupon(coupon.code);
    if (cartSubtotal === 0) setCoupon(null);
    // Re-validate only when the cart total changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSubtotal]);

  const handleCheckout = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      const response = await orderService.createOrder({
        customerName: name.trim(),
        customerPhone: phone.trim() || undefined,
        whatsappNumber: whatsapp.trim() || undefined,
        customerEmail: email.trim() || null,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        couponCode: coupon?.code,
      });
      setOrderNumber(response.data.orderNumber);
      setCoupon(null);
      setCouponInput("");
      clearCart();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong placing your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (orderNumber) {
    return (
      <Stack spacing={2} alignItems="center" textAlign="center" py={4}>
        <Typography variant="h5">Thank you for your order!</Typography>
        <Typography color="text.secondary">
          Your order <strong>{orderNumber}</strong> has been placed. We&apos;ll
          reach out shortly to confirm delivery details.
        </Typography>
        <Button component={Link} href="/shop" variant="contained">
          Continue Shopping
        </Button>
      </Stack>
    );
  }

  if (cart.length === 0) {
    return (
      <Stack spacing={2} alignItems="center" textAlign="center" py={4}>
        <Typography variant="h6">Your cart is empty</Typography>
        <Button component={Link} href="/shop" variant="contained">
          Browse Products
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={2} divider={<Divider flexItem />}>
        {cart.map((item) => (
          <Stack
            key={item.productId}
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <Box
              sx={{
                position: "relative",
                width: 84,
                height: 84,
                borderRadius: 1,
                overflow: "hidden",
                flexShrink: 0,
                bgcolor: "action.hover",
              }}
            >
              <Image
                src={firstImageUrl(item)}
                alt={item.product.name}
                fill
                sizes="84px"
                style={{ objectFit: "cover" }}
              />
            </Box>
            <Stack flex={1} spacing={0.5}>
              <Typography fontWeight={600}>{item.product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatBaseCurrencyInCurrency(
                  item.product.price,
                  currency,
                  rates,
                )}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                size="small"
                onClick={() =>
                  updateCartQuantity(item.productId, item.quantity - 1)
                }
                aria-label="Decrease quantity"
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ minWidth: 24, textAlign: "center" }}>
                {item.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() =>
                  updateCartQuantity(item.productId, item.quantity + 1)
                }
                aria-label="Increase quantity"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Typography
              sx={{ minWidth: 90, textAlign: "right" }}
              fontWeight={600}
            >
              {formatBaseCurrencyInCurrency(
                item.product.price * item.quantity,
                currency,
                rates,
              )}
            </Typography>
            <IconButton
              size="small"
              onClick={() => removeFromCart(item.productId)}
              aria-label="Remove item"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="Coupon code"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            disabled={Boolean(coupon)}
            sx={{ flex: 1 }}
          />
          {coupon ? (
            <Button
              variant="outlined"
              onClick={() => {
                setCoupon(null);
                setCouponInput("");
              }}
            >
              Remove
            </Button>
          ) : (
            <Button
              variant="outlined"
              disabled={!couponInput.trim() || applyingCoupon}
              onClick={() => applyCoupon(couponInput)}
            >
              {applyingCoupon ? "Checking..." : "Apply"}
            </Button>
          )}
        </Stack>
        {couponError ? <Alert severity="warning">{couponError}</Alert> : null}
      </Stack>

      <Stack spacing={0.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography color="text.secondary">
            {formatBaseCurrencyInCurrency(subtotal, currency, rates)}
          </Typography>
        </Stack>
        {discount > 0 && coupon && (
          <Stack direction="row" justifyContent="space-between">
            <Typography color="success.main">
              Discount ({coupon.code})
            </Typography>
            <Typography color="success.main">
              −{formatBaseCurrencyInCurrency(discount, currency, rates)}
            </Typography>
          </Stack>
        )}
        {vat > 0 && (
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">
              {tax.pricesIncludeVat
                ? `Includes VAT (${tax.vatPercentage}%)`
                : `VAT (${tax.vatPercentage}%)`}
            </Typography>
            <Typography color="text.secondary">
              {formatBaseCurrencyInCurrency(vat, currency, rates)}
            </Typography>
          </Stack>
        )}
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">
            {formatBaseCurrencyInCurrency(total, currency, rates)}
          </Typography>
        </Stack>
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h6">Checkout Details</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
        />
        <TextField
          label="WhatsApp Number"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          size="large"
          disabled={submitting}
          onClick={handleCheckout}
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </Button>
      </Stack>
    </Stack>
  );
};
