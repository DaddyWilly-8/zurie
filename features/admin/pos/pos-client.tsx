"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid, Paper, Stack, Typography } from "@mui/material";
import { AdminFeedbackSnackbar } from "@/components/admin";
import { ApiError } from "@/services/api/client";
import { outletService } from "@/services/outlets/outlet.service";
import { productService } from "@/services/products/product.service";
import { posService } from "@/services/pos/pos.service";
import { currencyService } from "@/services/currencies/currency.service";
import { PosProductGrid } from "./pos-product-grid";
import { PosCartPanel } from "./pos-cart-panel";
import { PosCheckoutPanel } from "./pos-checkout-panel";
import type { AdminProduct } from "@/features/admin/products";
import type { CustomerMode, PosCartLine } from "./types";

export const AdminPosClient = () => {
  const [cart, setCart] = useState<PosCartLine[]>([]);
  const [outletId, setOutletId] = useState<number | "">("");
  const [currencyId, setCurrencyId] = useState<number | "">("");
  const [customerMode, setCustomerMode] = useState<CustomerMode>("walkin");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  const { data: outlets = [] } = useQuery({
    queryKey: ["admin-outlets"],
    queryFn: outletService.list,
  });

  const { data: currencies = [] } = useQuery({
    queryKey: ["admin-currencies"],
    queryFn: currencyService.list,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () =>
      productService.listAdminProducts() as Promise<AdminProduct[]>,
  });

  const addToCart = (product: AdminProduct) => {
    setCart((prev) => {
      const existing = prev.find(
        (line) => String(line.productId) === String(product.id),
      );
      if (existing) {
        return prev.map((line) =>
          line.productId === existing.productId
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [
        ...prev,
        {
          productId: Number(product.id),
          name: product.name,
          price: product.salePrice ?? product.sale_price ?? product.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId: number, quantity: number) =>
    setCart((prev) =>
      prev.map((line) =>
        line.productId === productId ? { ...line, quantity } : line,
      ),
    );

  const removeFromCart = (productId: number) =>
    setCart((prev) => prev.filter((line) => line.productId !== productId));

  const resetSale = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerId("");
    setCouponCode("");
  };

  const canSubmit =
    cart.length > 0 &&
    outletId !== "" &&
    (customerMode === "walkin"
      ? customerName.trim() !== "" && customerPhone.trim() !== ""
      : customerId.trim() !== "");

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const response = await posService.sell({
        outletId,
        items: cart.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
        ...(customerMode === "existing"
          ? { customerId: Number(customerId) }
          : { customerName, customerPhone }),
        couponCode: couponCode || undefined,
        ...(currencyId !== "" ? { currencyId } : {}),
      });
      setMessage(
        `Sale complete — ${response.data.orderNumber}, total ${response.data.totalAmount.toLocaleString()}`,
      );
      setMessageType("success");
      resetSale();
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Failed to complete sale",
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3.2}>
      <AdminFeedbackSnackbar
        open={Boolean(message)}
        message={message}
        severity={messageType}
        onClose={() => setMessage("")}
      />
      <Typography sx={{ fontSize: { xs: "2rem", md: "2.2rem" } }}>
        Point of Sale
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <PosProductGrid products={products} onAdd={addToCart} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0 }}>
            <Stack spacing={3}>
              <PosCartPanel
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
              <PosCheckoutPanel
                outlets={outlets}
                outletId={outletId}
                onOutletChange={setOutletId}
                currencies={currencies}
                currencyId={currencyId}
                onCurrencyChange={setCurrencyId}
                customerMode={customerMode}
                onCustomerModeChange={setCustomerMode}
                customerName={customerName}
                onCustomerNameChange={setCustomerName}
                customerPhone={customerPhone}
                onCustomerPhoneChange={setCustomerPhone}
                customerId={customerId}
                onCustomerIdChange={setCustomerId}
                couponCode={couponCode}
                onCouponCodeChange={setCouponCode}
                disabled={!canSubmit}
                submitting={submitting}
                onSubmit={handleSubmit}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};
