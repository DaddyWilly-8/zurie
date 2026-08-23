import { Stack, Typography, Box } from "@mui/material";
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
        maxWidth: 1200,
        mx: "auto",
        width: "100%",
        px: { xs: 2, sm: 3, md: 0 },
      }}
    >
      {/* Header */}
      <Stack alignItems="center" spacing={1.5} textAlign="center">
        <Box
          sx={{
            display: "inline-block",
            px: 2.5,
            py: 0.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
          }}
        >
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.28em",
              fontSize: "0.6rem",
              color: "#b39a72",
            }}
          >
            Your Selection
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: { xs: "2.2rem", sm: "3rem", md: "4rem" },
            lineHeight: 1.05,
            color: "text.primary",
          }}
        >
          Shopping Bag
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.9rem", md: "1rem" },
            maxWidth: 450,
          }}
        >
          Review your selected pieces and proceed to checkout.
        </Typography>
      </Stack>

      {/* Cart Client */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          p: { xs: 2, sm: 3, md: 4 },
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          },
        }}
      >
        <CartClient />
      </Box>
    </Stack>
  );
}
