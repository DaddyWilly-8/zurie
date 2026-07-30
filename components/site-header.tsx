"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBagShopping,
  faClose,
  faMagnifyingGlass,
  faMinus,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { NAV_LINKS } from "@/constants/site";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { useShopStore } from "@/hooks/use-shop-store";
import {
  CURRENCY_OPTIONS,
  convertFromUsd,
  formatCurrency,
  type CurrencyCode,
} from "@/utils/currency";

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
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              component={Link}
              href="/"
              variant="h6"
              sx={{
                justifySelf: "start",
                fontFamily: "var(--font-playfair), serif",
                fontSize: { xs: "1.7rem", md: "2rem" },
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
                display: "flex",
                gap: { xs: 1.8, md: 3.2 },
                justifySelf: "center",
              }}
            >
              {NAV_LINKS.map((link) => (
                <Typography
                  key={link.href}
                  component={Link}
                  href={link.href}
                  variant="body2"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.34em",
                    fontSize: "0.72rem",
                    fontWeight: pathname === link.href ? 700 : 500,
                    color:
                      pathname === link.href
                        ? "primary.main"
                        : "text.secondary",
                    textDecoration: "none",
                    transition: "color 180ms ease",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                justifySelf: "end",
              }}
            >
              <Select
                size="small"
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value as CurrencyCode)
                }
                variant="standard"
                disableUnderline
                sx={{
                  minWidth: { xs: 72, md: 90 },
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  color: "text.secondary",
                  textTransform: "uppercase",
                  "& .MuiSelect-select": {
                    py: 0.35,
                    pr: "20px !important",
                  },
                }}
                renderValue={(value) => value}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.code} - {option.label}
                  </MenuItem>
                ))}
              </Select>
              <IconButton
                aria-label="Search"
                onClick={() => setIsSearchOpen((prev) => !prev)}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} fontSize={15} />
              </IconButton>
              <IconButton
                aria-label="Cart"
                onClick={() => {
                  setIsCartOpen(true);
                  setIsSearchOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faBagShopping} fontSize={15} />
              </IconButton>
              {cartCount > 0 ? (
                <Typography
                  component="span"
                  sx={{
                    ml: -0.25,
                    minWidth: 20,
                    textAlign: "center",
                    fontSize: "0.72rem",
                    color: "text.secondary",
                  }}
                >
                  {cartCount}
                </Typography>
              ) : null}
            </Box>
          </Toolbar>

          {isSearchOpen ? (
            <Box
              sx={{
                borderTop: "1px solid #ece2d5",
                py: 1.1,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
                gap: 1,
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                placeholder="Search the atelier..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box
                        component="span"
                        sx={{ color: "text.secondary", mr: 1 }}
                      >
                        <FontAwesomeIcon
                          icon={faMagnifyingGlass}
                          fontSize={12}
                        />
                      </Box>
                    ),
                  },
                }}
              />
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.26em",
                  fontSize: "0.68rem",
                  color: "text.secondary",
                  justifySelf: { xs: "start", md: "end" },
                }}
              >
                Search
              </Typography>
            </Box>
          ) : null}
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      >
        <Stack sx={{ width: { xs: "100vw", sm: 420 }, height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.6 }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-playfair), serif",
                fontSize: "2rem",
              }}
            >
              Your Bag
            </Typography>
            <IconButton
              onClick={() => setIsCartOpen(false)}
              aria-label="Close cart"
            >
              <FontAwesomeIcon icon={faClose} />
            </IconButton>
          </Stack>

          <Divider />

          <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 1.8 }}>
            {cart.length === 0 ? (
              <Typography color="text.secondary">Your bag is empty.</Typography>
            ) : (
              <Stack spacing={2}>
                {cart.map((item) => (
                  <Stack key={item.productId} direction="row" spacing={1.4}>
                    <Box
                      component="img"
                      src={
                        item.product.images[0]?.url ??
                        "/images/products/fallback.png"
                      }
                      alt={item.product.name}
                      sx={{
                        width: 66,
                        height: 66,
                        objectFit: "cover",
                        borderRadius: 0.5,
                      }}
                    />
                    <Stack spacing={0.3} sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontSize: "0.86rem", lineHeight: 1.3 }}>
                        {item.product.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.8rem", color: "text.secondary" }}
                      >
                        {item.product.colors[0]?.name ?? "Classic"}
                      </Typography>
                      <Typography sx={{ fontSize: "0.86rem" }}>
                        {formatCurrency(
                          convertFromUsd(
                            item.product.price * item.quantity,
                            currency,
                            rates,
                          ),
                          currency,
                        )}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.8}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <FontAwesomeIcon icon={faMinus} fontSize={10} />
                      </IconButton>
                      <Typography sx={{ fontSize: "0.8rem" }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateCartQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <FontAwesomeIcon icon={faPlus} fontSize={10} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <FontAwesomeIcon icon={faTrash} fontSize={11} />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          <Divider />

          <Stack spacing={1.2} sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ letterSpacing: "0.2em", fontSize: "0.72rem" }}>
                SUBTOTAL
              </Typography>
              <Typography>
                {formatCurrency(convertFromUsd(subtotal, currency, rates), currency)}
              </Typography>
            </Stack>
            <Button
              component={Link}
              href="/cart"
              variant="contained"
              onClick={() => setIsCartOpen(false)}
              endIcon={<FontAwesomeIcon icon={faArrowRight} fontSize={11} />}
            >
              View Bag & Checkout
            </Button>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
};
