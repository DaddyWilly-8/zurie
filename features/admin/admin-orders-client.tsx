"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Card,
  CardContent,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import {
  orderActions,
  OrdersFilters,
  OrdersTable,
  type AdminOrderRow,
} from "@/features/admin/orders";

type Props = {
  initialData: AdminOrderRow[];
  initialCount: number;
  initialPage: number;
  initialSearch: string;
  initialStatus: string;
};

export const AdminOrdersClient = ({
  initialData,
  initialCount,
  initialPage,
  initialSearch,
  initialStatus,
}: Props) => {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const {
    data: payload = { data: initialData, count: initialCount },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-orders", page, search, status],
    queryFn: () => orderActions.list(page, search, status),
    initialData: { data: initialData, count: initialCount },
  });

  const rows = payload.data;
  const count = payload.count;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / orderActions.pageSize)), [count]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await orderActions.updateStatus(id, nextStatus);
      setMessage("Order updated successfully");
      setMessageType("success");
    } catch {
      setMessage("Failed to update order");
      setMessageType("error");
    }
    await refetch();
  };

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  return (
    <Stack spacing={3}>
      {message ? <Alert severity={messageType} onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>{message}</Alert> : null}

      <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none", bgcolor: "background.paper" }}>
        <CardContent sx={{ p: 3 }}>
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "primary.main" }}>
            Orders
          </Typography>
          <Typography variant="h6" sx={{ color: "text.primary" }}>
            Customer Orders
          </Typography>
        </Stack>

        <OrdersFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onApply={() => {
            setPage(1);
          }}
        />

        {isError ? (
          <Typography color="error.main" sx={{ py: 2 }}>
            Failed to load orders.
          </Typography>
        ) : isLoading ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            Loading orders...
          </Typography>
        ) : (
          <OrdersTable rows={rows} onStatusChange={updateStatus} />
        )}

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Stack>
      </CardContent>
      </Card>
    </Stack>
  );
};
