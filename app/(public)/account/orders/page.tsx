"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { useCurrencyStore } from "@/hooks/use-currency-store";
import { accountService } from "@/services/account/account.service";
import type { OrderResponse } from "@/services/orders/order.service";
import { formatBaseCurrencyInCurrency } from "@/utils/currency";

const PAGE_SIZE = 10;

/**
 * Dedicated order history — split out of /account (see that page's
 * docblock) so "My Account" and "Orders" in the header menu actually go
 * somewhere different, and so order history gets real pagination instead
 * of a fixed 20-row slice buried in the middle of the profile page.
 */
export default function AccountOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useCustomerAuth();
  const currency = useCurrencyStore((state) => state.currency);
  const rates = useCurrencyStore((state) => state.rates);

  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/account/orders");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);

    void accountService
      .getOrders({ page, pageSize: PAGE_SIZE })
      .then((response) => {
        if (!active) return;
        setOrders(response.data);
        setTotalCount(response.meta.count);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  if (authLoading || !user) {
    return (
      <Container sx={{ py: 10, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            component={Link}
            href="/account"
            aria-label="Back to My Account"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Order History
            </Typography>
            <Typography color="text.secondary">
              {loading ? "Loading..." : `${totalCount} order(s)`}
            </Typography>
          </Box>
        </Stack>

        <Paper variant="outlined" sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : orders.length === 0 ? (
            <Alert severity="info">
              You haven&apos;t placed any orders yet.
            </Alert>
          ) : (
            <>
              <Stack divider={<Divider />} spacing={2}>
                {orders.map((order) => (
                  <Stack
                    key={order.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={1}
                  >
                    <Box>
                      <Typography fontWeight={600}>
                        {order.orderNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={order.status.replace(/_/g, " ")}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                    <Typography fontWeight={600}>
                      {formatBaseCurrencyInCurrency(
                        order.totalAmount,
                        currency,
                        rates,
                      )}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              {totalPages > 1 ? (
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Stack>
              ) : null}
            </>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
