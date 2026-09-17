"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { useShopStore } from "@/hooks/use-shop-store";
import {
  SiteHeaderActions,
  SiteHeaderCartDrawer,
  SiteHeaderNavLinks,
  SiteHeaderSearchPanel,
} from "@/components/site-header/index";
import { useThemeMode } from "@/providers/theme-provider";
import { productService } from "@/services/products/product.service";
import { categoryService } from "@/services/categories/category.service";
import { productMatchesQuery } from "@/utils/product-search";
import { BackdropSpinner } from "@/components/backdrop-spinner";

const SEARCH_RESULT_LIMIT = 6;

export const SiteHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isNavPending, startNavigation] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

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
  const { mode, toggleMode } = useThemeMode();

  useEffect(() => {
    void refreshRates();
  }, [refreshRates]);

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );

  const { data: searchProducts = [] } = useQuery({
    queryKey: ["storefront-products", "all"],
    queryFn: () => productService.getStorefrontProducts({}),
    enabled: isSearchOpen,
    staleTime: 60_000,
  });

  const { data: searchCategories = [] } = useQuery({
    queryKey: ["storefront-categories"],
    queryFn: categoryService.listCategories,
    enabled: isSearchOpen,
    staleTime: 60_000,
  });

  const matchedProducts = useMemo(() => {
    if (!searchValue.trim()) return [];
    return searchProducts
      .filter((product) => productMatchesQuery(product, searchValue))
      .slice(0, SEARCH_RESULT_LIMIT);
  }, [searchProducts, searchValue]);

  const matchedCategories = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    if (!normalized) return [];
    return searchCategories
      .filter((cat) => cat.name.toLowerCase().includes(normalized))
      .slice(0, SEARCH_RESULT_LIMIT)
      .map((cat) => ({ name: cat.name, slug: cat.slug }));
  }, [searchCategories, searchValue]);

  // Route transitions can take a moment (data fetching on the target page) —
  // keep the search panel open with a progress indicator on the clicked item
  // until the transition finishes, then close it. See SiteHeaderSearchPanel's
  // `pendingKey` prop for how each item shows its own spinner.
  useEffect(() => {
    if (!isNavPending && pendingKey) {
      setIsSearchOpen(false);
      setPendingKey(null);
    }
  }, [isNavPending, pendingKey]);

  const navigate = (path: string, key: string) => {
    setPendingKey(key);
    startNavigation(() => {
      router.push(path);
    });
  };

  const goToShopSearch = (query: string) => {
    const trimmed = query.trim();
    navigate(
      trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop",
      "search",
    );
  };

  const goToProduct = (slug: string) => {
    navigate(`/shop/${slug}`, `product:${slug}`);
  };

  const goToCategory = (slug: string) => {
    navigate(`/shop?category=${encodeURIComponent(slug)}`, `category:${slug}`);
  };

  // Default (no query typed) quick filters live on the Home page, not Shop —
  // scroll there directly if already home, otherwise navigate with a hash.
  const goToHomeSection = (anchor: string) => {
    if (pathname === "/") {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      setIsSearchOpen(false);
    } else {
      navigate(`/#${anchor}`, `home:${anchor}`);
    }
  };

  // Switching tabs (e.g. Home -> Shop) can be slow if the target page has to
  // fetch data — show the same branded spinner as search navigation rather
  // than leaving the click looking unresponsive.
  const goToNavLink = (href: string) => navigate(href, `nav:${href}`);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(26, 25, 23, 0.94)"
              : "rgba(252, 249, 245, 0.95)",
          borderBottom: (theme) =>
            `1px solid ${theme.palette.mode === "dark" ? "#2f2a24" : "#e7dfd3"}`,
          backdropFilter: "blur(10px)",
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

            <Box
              sx={{
                minWidth: 0,
                px: { xs: 0.4, md: 0 },
                display: { xs: "none", md: "block" },
              }}
            >
              <SiteHeaderNavLinks
                pathname={pathname ?? ""}
                onNavigate={goToNavLink}
              />
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
                mode={mode}
                onThemeToggle={toggleMode}
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
              onSubmit={goToShopSearch}
              matchedProducts={matchedProducts}
              matchedCategories={matchedCategories}
              onSelectProduct={goToProduct}
              onSelectCategory={goToCategory}
              onSelectQuickFilter={goToHomeSection}
              pendingKey={pendingKey}
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

      <BackdropSpinner open={isNavPending} />
    </>
  );
};
