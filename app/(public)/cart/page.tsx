import { Stack, Typography } from "@mui/material";
import { CartClient } from "@/features/cart/cart-client";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Shopping Cart | Zuriè",
  description: "Review your selected products and checkout via WhatsApp.",
  path: "/cart",
});

export default function CartPage() {
  return (
    <Stack
      spacing={{ xs: 3.2, md: 4.8 }}
      sx={{
        pt: { xs: 2.5, md: 4.6 },
        pb: { xs: 5, md: 7 },
        maxWidth: 1180,
        mx: "auto",
        width: "100%",
      }}
    >
      <Stack alignItems="center" spacing={1.1} textAlign="center">
        <Typography
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            fontSize: "0.68rem",
            color: "primary.main",
          }}
        >
          Your Selection
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: { xs: "2.45rem", md: "4.2rem" },
            lineHeight: 1,
          }}
        >
          Shopping Bag
        </Typography>
      </Stack>
      <CartClient />
    </Stack>
  );
}
