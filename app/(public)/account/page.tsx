"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCustomerAuth } from "@/providers/customer-auth-provider";
import { accountService } from "@/services/account/account.service";
import type { OrderResponse } from "@/services/orders/order.service";
import { formatCurrency } from "@/utils/currency";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useCustomerAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/account");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    void accountService
      .getOrders({ page: 1, pageSize: 20 })
      .then((response) => {
        if (active) setOrders(response.data);
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

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

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Order History
          </Typography>
          {ordersLoading ? (
            <CircularProgress size={24} />
          ) : orders.length === 0 ? (
            <Alert severity="info">
              You haven&apos;t placed any orders yet.
            </Alert>
          ) : (
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
                    {formatCurrency(order.totalAmount, "TZS")}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
