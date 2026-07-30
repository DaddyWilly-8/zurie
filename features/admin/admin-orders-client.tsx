"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { orderService } from "@/services/orders/order.service";

export type AdminOrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  whatsapp_number: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
};

type Props = {
  initialData: AdminOrderRow[];
  initialCount: number;
  initialPage: number;
  initialSearch: string;
  initialStatus: string;
};

const PAGE_SIZE = 10;

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

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  const load = useCallback(async (nextPage: number, nextSearch = search, nextStatus = status) => {
    const payload = await orderService.listOrders({
      page: nextPage,
      pageSize: PAGE_SIZE,
      search: nextSearch.trim() || undefined,
      status: nextStatus || undefined,
    });

    setRows((payload.data ?? []) as AdminOrderRow[]);
    setCount(payload.count ?? 0);
    setPage(nextPage);
  }, [search, status]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await orderService.updateOrderStatus(id, nextStatus);
      setMessage("Order updated");
    } catch {
      setMessage("Failed to update order");
    }
    await load(page);
  };

  useEffect(() => {
    if (initialData.length === 0) {
      void load(initialPage, initialSearch, initialStatus);
    }
  }, [initialData.length, initialPage, initialSearch, initialStatus, load]);

  return (
    <Stack spacing={2}>
      {message ? <Alert severity="info">{message}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            label="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
          />
          <TextField
            label="Status"
            select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="ready_for_delivery">Ready for Delivery</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
          <Button variant="contained" onClick={() => load(1, search, status)}>
            Apply
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>WhatsApp</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.order_number}</TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{row.customer_name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.customer_phone}
                  </Typography>
                </TableCell>
                <TableCell>{row.whatsapp_number}</TableCell>
                <TableCell>{row.total_amount}</TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={row.status}
                    onChange={(event) => updateStatus(row.id, event.target.value)}
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="ready_for_delivery">Ready for Delivery</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">No orders found.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Paper>

      <Stack direction="row" justifyContent="flex-end">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => {
            void load(value);
          }}
          color="primary"
        />
      </Stack>
    </Stack>
  );
};
