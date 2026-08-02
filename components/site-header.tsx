"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { useShopStore } from "@/hooks/use-shop-store";
import {
  SiteHeaderActions,
  SiteHeaderCartDrawer,
  SiteHeaderNavLinks,
  SiteHeaderSearchPanel,
} from "@/components/site-header/index";

export const SiteHeader = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const cart = useShopStore((state) => state.cart);
  const cartCount = useShopStore((state) =>
    state.cart.reduce((sum, item) => sum + item.quantity, 0),
  );
  const updateCartQuantity = useShopStore((state) => state.updateCartQuantity);
  const removeFromCart = useShopStore((state) => state.removeFromCart);
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const refreshRates = useCurrencyStore((state) => state.refreshRates);

  useEffect(() => {
    void refreshRates();
  }, [refreshRates]);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(252, 249, 245, 0.95)",
          borderBottom: "1px solid #e7dfd3",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              py: 1.2,
              display: "grid",
              gridTemplateColumns: { xs: "auto 1fr auto", md: "1fr auto 1fr" },
              alignItems: "center",
              gap: { xs: 1, md: 2 },
              minWidth: 0,
            }}
          >
            <Typography
              component={Link}
              href="/"
              variant="h6"
              sx={{
                justifySelf: "start",
                fontFamily: "var(--font-playfair), serif",
                fontSize: { xs: "1.35rem", md: "2rem" },
                fontWeight: 500,
                color: "text.primary",
                textDecoration: "none",
                letterSpacing: 0.2,
                lineHeight: 1,
              }}
            >
              Zuriè
            </Typography>

            <Box sx={{ minWidth: 0, px: { xs: 0.4, md: 0 }, display: { xs: "none", md: "block" } }}>
              <SiteHeaderNavLinks pathname={pathname ?? ""} />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                justifySelf: "end",
              }}
            >
              <SiteHeaderActions
                currency={currency}
                cartCount={cartCount}
                onCurrencyChange={setCurrency}
                onSearchToggle={() => setIsSearchOpen((prev) => !prev)}
                onCartOpen={() => {
                  setIsCartOpen(true);
                  setIsSearchOpen(false);
                }}
              />
            </Box>
          </Toolbar>

          <Box sx={{ display: { xs: "block", md: "none" }, pb: 1, px: 0.2 }}>
            <SiteHeaderNavLinks pathname={pathname ?? ""} />
          </Box>

          {isSearchOpen ? (
            <SiteHeaderSearchPanel
              value={searchValue}
              onChange={setSearchValue}
            />
          ) : null}
        </Container>
      </AppBar>

      <SiteHeaderCartDrawer
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        subtotal={subtotal}
        currency={currency}
        rates={rates}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
      />
    </>
  );
};
