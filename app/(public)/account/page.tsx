"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { AccountNotifications, AccountWishlist } from "@/features/account";

/**
 * Profile overview — was previously the single page both "My Account" and
 * "Orders" in the header's AccountMenu linked to (the same href, so they
 * opened identically and order history was just one long section buried
 * in the middle of this page's scroll). Order history now lives at its
 * own route, /account/orders (see that page) — this one keeps the
 * profile summary, notifications, and wishlist, with a card linking to
 * order history instead of inlining it.
 */
export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useCustomerAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/account");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <Container sx={{ py: 10, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontFamily: "var(--font-playfair), serif" }}
            >
              My Account
            </Typography>
            <Typography color="text.secondary">
              {user.name} — {user.email}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            Sign Out
          </Button>
        </Stack>

        <AccountNotifications />

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6">Order History</Typography>
            <Typography color="text.secondary">
              Track every order you&apos;ve placed with us.
            </Typography>
          </Box>
          <Button component={Link} href="/account/orders" variant="contained">
            View Orders
          </Button>
        </Paper>

        <AccountWishlist />
      </Stack>
    </Container>
  );
}
