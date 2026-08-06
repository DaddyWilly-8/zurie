import Link from "next/link";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faClose,
  faMinus,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  convertFromUsd,
  formatCurrency,
  type CurrencyCode,
  type CurrencyRateMap,
} from "@/utils/currency";
import type { CartItem } from "@/types/product";

type Props = {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  currency: CurrencyCode;
  rates: CurrencyRateMap;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export const SiteHeaderCartDrawer = ({
  open,
  onClose,
  cart,
  subtotal,
  currency,
  rates,
  onUpdateQuantity,
  onRemove,
}: Props) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
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
          <IconButton onClick={onClose} aria-label="Close cart">
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
                    src={item.product.images?.[0]?.url ?? "/images/products/fallback.png"}
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
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                      {item.product.colors[0]?.name ?? "Classic"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.86rem" }}>
                      {formatCurrency(
                        convertFromUsd(item.product.price * item.quantity, currency, rates),
                        currency,
                      )}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.8}>
                    <IconButton
                      size="small"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                      <FontAwesomeIcon icon={faMinus} fontSize={10} />
                    </IconButton>
                    <Typography sx={{ fontSize: "0.8rem" }}>{item.quantity}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      <FontAwesomeIcon icon={faPlus} fontSize={10} />
                    </IconButton>
                    <IconButton size="small" onClick={() => onRemove(item.productId)}>
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
            onClick={onClose}
            endIcon={<FontAwesomeIcon icon={faArrowRight} fontSize={11} />}
          >
            View Bag & Checkout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
};
