"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [rows, setRows] = useState(initialData);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / orderActions.pageSize)), [count]);

  const load = useCallback(async (nextPage: number, nextSearch = search, nextStatus = status) => {
    try {
      const payload = await orderActions.list(nextPage, nextSearch, nextStatus);
      setRows(payload.data);
      setCount(payload.count);
      setPage(nextPage);
    } catch {
      setMessage("Failed to load orders");
      setMessageType("error");
    }
  }, [search, status]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await orderActions.updateStatus(id, nextStatus);
      setMessage("Order updated successfully");
      setMessageType("success");
    } catch {
      setMessage("Failed to update order");
      setMessageType("error");
    }
    await load(page);
  };

  useEffect(() => {
    if (initialData.length === 0) {
      void load(initialPage, initialSearch, initialStatus);
    }
  }, [initialData.length, initialPage, initialSearch, initialStatus, load]);

  return (
    <Stack spacing={3}>
      {message ? <Alert severity={messageType} onClose={() => setMessage("")} sx={{ borderRadius: 1.5 }}>{message}</Alert> : null}

      <Card sx={{ border: "1px solid #ebe2d5", boxShadow: "none", bgcolor: "#fbf8f3" }}>
        <CardContent sx={{ p: 3 }}>
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ letterSpacing: "0.24em", color: "#aa8d66" }}>
            Orders
          </Typography>
          <Typography variant="h6" sx={{ color: "#171512" }}>
            Customer Orders
          </Typography>
        </Stack>

        <OrdersFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onApply={() => {
            void load(1, search, status);
          }}
        />

        <OrdersTable rows={rows} onStatusChange={updateStatus} />

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => {
              void load(value);
            }}
            color="primary"
          />
        </Stack>
      </CardContent>
      </Card>
    </Stack>
  );
};
